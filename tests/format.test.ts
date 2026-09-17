import { describe, it, expect } from 'vitest'
import { formatDate } from '../utils/format'

describe('formatDate', () => {
  it('returns dash for undefined date', () => {
    expect(formatDate()).toBe('—')
    expect(formatDate()).toBe('—')
    expect(formatDate('')).toBe('—')
  })

  it('formats an ISO date as dd.mm.yyyy', () => {
    expect(formatDate('2026-01-05T12:00:00.000Z')).toBe('05.01.2026')
  })
})
