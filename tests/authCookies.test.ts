import { describe, it, expect, beforeEach } from 'vitest'
import { readCookie, writeCookie } from '~/utils/authCookies'

describe('authCookies', () => {
  beforeEach(() => {
    writeCookie('auth_token', null)
    writeCookie('refresh_token', null)
  })

  it('returns null for a missing cookie', () => {
    expect(readCookie('auth_token')).toBeNull()
  })

  it('writes and reads a cookie', () => {
    writeCookie('auth_token', 'token123')
    expect(readCookie('auth_token')).toBe('token123')
  })

  it('round-trips a JWT-like value', () => {
    const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.abcDEF-_123'
    writeCookie('auth_token', token)
    expect(readCookie('auth_token')).toBe(token)
  })

  it('round-trips values with special characters', () => {
    writeCookie('auth_token', 'a b/c+d:e')
    expect(readCookie('auth_token')).toBe('a b/c+d:e')
  })

  it('deletes a cookie on null value', () => {
    writeCookie('auth_token', 'token123')
    writeCookie('auth_token', null)
    expect(readCookie('auth_token')).toBeNull()
  })

  it('keeps cookies isolated by name', () => {
    writeCookie('auth_token', 'access-token')
    writeCookie('refresh_token', 'refresh-token')
    expect(readCookie('auth_token')).toBe('access-token')
    expect(readCookie('refresh_token')).toBe('refresh-token')
  })

  it('does not match a cookie whose name is a prefix of another', () => {
    writeCookie('auth_token_v2', 'other')
    writeCookie('auth_token', 'value')
    expect(readCookie('auth_token')).toBe('value')
  })
})
