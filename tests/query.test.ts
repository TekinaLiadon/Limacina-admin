import { describe, it, expect } from 'vitest'
import { buildQuery } from '~/api/query'

describe('buildQuery', () => {
  it('returns empty string for undefined query', () => {
    expect(buildQuery()).toBe('')
    expect(buildQuery(undefined)).toBe('')
  })

  it('returns empty string for empty object', () => {
    expect(buildQuery({})).toBe('')
  })

  it('serializes a single param', () => {
    expect(buildQuery({ limit: 50 })).toBe('?limit=50')
  })

  it('serializes multiple params', () => {
    expect(buildQuery({ date: '2026-01-01', offset: 0, limit: 100 }))
      .toBe('?date=2026-01-01&offset=0&limit=100')
  })

  it('skips null, undefined and empty string values', () => {
    expect(buildQuery({ a: null, b: undefined, c: '', d: 'x' })).toBe('?d=x')
  })

  it('serializes booleans', () => {
    expect(buildQuery({ approved: true, banned: false })).toBe('?approved=true&banned=false')
  })

  it('encodes special characters', () => {
    expect(buildQuery({ q: 'a&b=c' })).toBe('?q=a%26b%3Dc')
  })
})
