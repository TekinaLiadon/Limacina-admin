import { writeCookie, ROLE_COOKIE } from '~/utils/authCookies'
import { ApiEndpoint } from '~/api/endpoints'
import type { AuthResponse } from '~/api/types'

export const useAuth = () => {
  const config = useRuntimeConfig()
  const { invalidateSession } = useApi()

  const login = async (username: string, password: string) => {
    const res = await $fetch<AuthResponse>(`${config.public.apiBase}${ApiEndpoint.AuthLogin}`, {
      method: 'POST',
      body: { username, password },
    })

    if (res.role === 'user') {
      throw new Error('Доступ только для администраторов')
    }

    writeCookie('auth_token', res.tokens.access_token)
    writeCookie('refresh_token', res.tokens.refresh_token)
    writeCookie(ROLE_COOKIE, res.role)
    navigateTo('/unapproved')
  }

  const register = async (username: string, password: string) => {
    await $fetch(`${config.public.apiBase}${ApiEndpoint.InitOwner}`, {
      method: 'POST',
      body: { username, password },
    })
  }

  const logout = () => {
    invalidateSession()
    writeCookie('auth_token', null)
    writeCookie('refresh_token', null)
    writeCookie(ROLE_COOKIE, null)
    navigateTo('/login')
  }

  return { login, register, logout }
}
