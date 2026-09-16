const DEFAULT_MAX_AGE = 60 * 60 * 24 * 30

export const ACCESS_COOKIE = 'auth_token'
export const REFRESH_COOKIE = 'refresh_token'
export const ROLE_COOKIE = 'user_role'
export const USER_NAME_COOKIE = 'user_name'

export const writeCookie = (name: string, value: string | null, maxAge = DEFAULT_MAX_AGE): void => {
  if (typeof document === 'undefined') return
  document.cookie = value === null
    ? `${name}=; Max-Age=-1; Path=/`
    : `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/`
}

export const clearAuthCookies = (): void => {
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, ROLE_COOKIE, USER_NAME_COOKIE]) {
    writeCookie(name, null)
  }
}

export const readCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`, 'u'))
  return match ? decodeURIComponent(match[1]) : null
}
