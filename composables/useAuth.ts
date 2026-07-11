export const useAuth = () => {
  const config = useRuntimeConfig()
  const token = useCookie('auth_token', { maxAge: 60 * 60 * 24 * 30 })

  const login = async (username: string, password: string) => {
    const res = await $fetch<{
      tokens: { access_token: string; refresh_token: string }
      uuid: string
      username: string
      role: string
    }>(`${config.public.apiBase}/auth/login`, {
      method: 'POST',
      body: { username, password },
    })

    if (res.role === 'user') {
      throw new Error('Доступ только для администраторов')
    }

    token.value = res.tokens.access_token
    navigateTo('/unapproved')
  }

  const register = async (username: string, password: string) => {
    await $fetch(`${config.public.apiBase}/technical/init-owner`, {
      method: 'POST',
      body: { username, password },
    })
  }

  const logout = () => {
    token.value = null
    navigateTo('/login')
  }

  return { login, register, logout }
}
