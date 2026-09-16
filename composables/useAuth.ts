import {
  writeCookie, clearAuthCookies,
  ACCESS_COOKIE, REFRESH_COOKIE, ROLE_COOKIE, USER_NAME_COOKIE,
} from '~/utils/authCookies'
import { ApiEndpoint } from '~/api/endpoints'
import type { AuthResponse, InitOwnerRequest } from '~/api/types'

interface AuthApi {
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string, token: string) => Promise<void>
  logout: () => void
}

export const useAuth = (): AuthApi => {
  const config = useRuntimeConfig()
  const { invalidateSession } = useApi()

  const login = async (username: string, password: string): Promise<void> => {
    const res = await $fetch<AuthResponse>(`${config.public.apiBase}${ApiEndpoint.AuthLogin}`, {
      method: 'POST',
      body: { username, password },
    })

    if (res.role === 'user') {
      throw new Error('Доступ только для администраторов')
    }

    writeCookie(ACCESS_COOKIE, res.tokens.access_token)
    writeCookie(REFRESH_COOKIE, res.tokens.refresh_token)
    writeCookie(ROLE_COOKIE, res.role)
    writeCookie(USER_NAME_COOKIE, res.username)
    navigateTo('/unapproved')
  }

  const register = async (username: string, password: string, token: string): Promise<void> => {
    const body: InitOwnerRequest = { token, username, password }
    await $fetch(`${config.public.apiBase}${ApiEndpoint.InitOwner}`, {
      method: 'POST',
      body,
    })
  }

  const logout = (): void => {
    invalidateSession()
    clearAuthCookies()
    navigateTo('/login')
  }

  return { login, register, logout }
}
