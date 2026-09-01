import { readCookie, writeCookie } from '~/utils/authCookies'
import { buildQuery, type QueryParams } from '~/api/query'
import { ApiEndpoint } from '~/api/endpoints'
import { toFetchError } from '~/api/errors'
import type { AuthResponse } from '~/api/types'

interface ApiResponse<T> {
  data: Ref<T | null>
  error: Ref<string | null>
  pending: Ref<boolean>
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'
type RequestBody = Record<string, unknown> | FormData

const ACCESS_COOKIE = 'auth_token'
const REFRESH_COOKIE = 'refresh_token'

let refreshInFlight: Promise<boolean> | null = null

export const useApi = () => {
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

  const invalidateSession = () => {
    const refreshToken = readCookie(REFRESH_COOKIE)
    if (!refreshToken) return
    $fetch(`${baseURL}${ApiEndpoint.AuthInvalidate}`, {
      method: 'POST',
      body: { refresh_token: refreshToken },
    }).catch(() => {})
  }

  const request = async <T>(
    path: string,
    options: {
      method?: HttpMethod
      body?: RequestBody
      query?: QueryParams
    } = {}
  ): Promise<ApiResponse<T>> => {
    const data = ref<T | null>(null) as Ref<T | null>
    const error = ref<string | null>(null)
    const pending = ref(true)

    const url = `${baseURL}${path}${buildQuery(options.query)}`

    const attempt = () => {
      const token = readCookie(ACCESS_COOKIE)
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      return $fetch<T>(url, {
        method: options.method ?? 'GET',
        headers,
        body: options.body,
      })
    }

    try {
      try {
        data.value = await attempt()
      } catch (e) {
        if (toFetchError(e).statusCode !== 401) throw e
        const refreshed = await refreshTokens()
        if (!refreshed) throw e
        data.value = await attempt()
      }
    } catch (e) {
      const err = toFetchError(e)
      if (err.statusCode === 401) {
        invalidateSession()
        writeCookie(ACCESS_COOKIE, null)
        writeCookie(REFRESH_COOKIE, null)
        error.value = 'Unauthorized'
        navigateTo('/login')
      } else {
        error.value = err.data?.errorMessage || err.message || 'Request failed'
      }
    } finally {
      pending.value = false
    }

    return { data, error, pending }
  }

  return {
    get: <T>(path: string, query?: QueryParams) => request<T>(path, { query }),
    post: <T>(path: string, body?: RequestBody) => request<T>(path, { method: 'POST', body }),
    patch: <T>(path: string, body?: RequestBody) => request<T>(path, { method: 'PATCH', body }),
    del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
    invalidateSession,
  }
}
