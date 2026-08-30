import { describe, it, expect } from 'vitest'
import { formatDate, capitalize } from '../utils/format'

describe('formatDate', () => {
  it('returns dash for undefined date', () => {
    expect(formatDate()).toBe('—')
    expect(formatDate(undefined)).toBe('—')
    expect(formatDate('')).toBe('—')
  })

  it('formats an ISO date as dd.mm.yyyy', () => {
    expect(formatDate('2026-01-05T12:00:00.000Z')).toBe('05.01.2026')
  })
})

describe('capitalize', () => {
  it('capitalizes first letter', () => {
    expect(capitalize('linux')).toBe('Linux')
    expect(capitalize('windows')).toBe('Windows')
  })

  it('does not change already capitalized', () => {
    expect(capitalize('Linux')).toBe('Linux')
  })

  it('returns empty string for empty input', () => {
    expect(capitalize('')).toBe('')
  })
})
