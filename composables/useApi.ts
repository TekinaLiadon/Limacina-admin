import {
  readCookie, writeCookie, clearAuthCookies,
  ACCESS_COOKIE, REFRESH_COOKIE, ROLE_COOKIE, USER_NAME_COOKIE,
} from '~/utils/authCookies'
import { buildQuery, type QueryParams } from '~/api/query'
import { ApiEndpoint } from '~/api/endpoints'
import { toFetchError, fetchErrorMessage } from '~/api/errors'
import type { AuthResponse } from '~/api/types'

interface ApiResponse<TData> {
  data: Ref<TData | null>
  error: Ref<string | null>
  pending: Ref<boolean>
  cause: Ref<unknown>
}

interface ApiClient {
  get: <TData>(path: string, query?: QueryParams) => Promise<ApiResponse<TData>>
  post: <TData>(path: string, body?: RequestBody) => Promise<ApiResponse<TData>>
  patch: <TData>(path: string, body?: RequestBody) => Promise<ApiResponse<TData>>
  del: <TData>(path: string) => Promise<ApiResponse<TData>>
  invalidateSession: () => void
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'
type RequestBody = Record<string, unknown> | FormData

let refreshInFlight: Promise<boolean> | null = null

export const useApi = (): ApiClient => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase

  const refreshTokens = (): Promise<boolean> => {
    if (!refreshInFlight) {
      refreshInFlight = (async () => {
        const refreshToken = readCookie(REFRESH_COOKIE)
        if (!refreshToken) return false

        try {
          const res = await $fetch<AuthResponse>(`${baseURL}${ApiEndpoint.AuthRefresh}`, {
            method: 'POST',
            body: { refresh_token: refreshToken },
          })
          writeCookie(ACCESS_COOKIE, res.tokens.access_token)
          writeCookie(REFRESH_COOKIE, res.tokens.refresh_token)
          if (res.role) writeCookie(ROLE_COOKIE, res.role)
          if (res.username) writeCookie(USER_NAME_COOKIE, res.username)
          return true
        } catch {
          return false
        }
      })().finally(() => {
        refreshInFlight = null
      })
    }
    return refreshInFlight
  }

  const invalidateSession = (): void => {
    const refreshToken = readCookie(REFRESH_COOKIE)
    if (!refreshToken) return

    $fetch(`${baseURL}${ApiEndpoint.AuthInvalidate}`, {
      method: 'POST',
      body: { refresh_token: refreshToken },
    }).catch(() => null)
  }

  const request = async <TData>(
    path: string,
    options: {
      method?: HttpMethod
      body?: RequestBody
      query?: QueryParams
    } = {}
  ): Promise<ApiResponse<TData>> => {
    const data = ref<TData | null>(null) as Ref<TData | null>
    const error = ref<string | null>(null)
    const cause = ref<unknown>(null)
    const pending = ref(true)

    const url = `${baseURL}${path}${buildQuery(options.query)}`

    const attempt = (): Promise<TData> => {
      const token = readCookie(ACCESS_COOKIE)
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      return $fetch<TData>(url, {
        method: options.method ?? 'GET',
        headers,
        body: options.body,
      })
    }

    try {
      try {
        data.value = await attempt()
      } catch (failure) {
        if (toFetchError(failure).statusCode !== 401) throw failure
        const refreshed = await refreshTokens()
        if (!refreshed) throw failure
        data.value = await attempt()
      }
    } catch (failure) {
      const fetchError = toFetchError(failure)
      cause.value = failure
      if (fetchError.statusCode === 401) {
        invalidateSession()
        clearAuthCookies()
        error.value = 'Сессия истекла, войдите заново'
        navigateTo('/login')
      } else {
        error.value = fetchErrorMessage(failure) || 'Request failed'
      }
    } finally {
      pending.value = false
    }

    return { data, error, pending, cause }
  }

  return {
    get: <TData>(path: string, query?: QueryParams): Promise<ApiResponse<TData>> => request<TData>(path, { query }),
    post: <TData>(path: string, body?: RequestBody): Promise<ApiResponse<TData>> => request<TData>(path, { method: 'POST', body }),
    patch: <TData>(path: string, body?: RequestBody): Promise<ApiResponse<TData>> => request<TData>(path, { method: 'PATCH', body }),
    del: <TData>(path: string): Promise<ApiResponse<TData>> => request<TData>(path, { method: 'DELETE' }),
    invalidateSession,
  }
}
