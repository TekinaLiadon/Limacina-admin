const DEFAULT_MAX_AGE = 60 * 60 * 24 * 30

export const readCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export const writeCookie = (name: string, value: string | null, maxAge = DEFAULT_MAX_AGE) => {
  if (typeof document === 'undefined') return
  document.cookie = value === null
    ? `${name}=; Max-Age=-1; Path=/`
    : `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/`
}
