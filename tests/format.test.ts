import { describe, it, expect } from 'vitest'
import { formatBytes, formatDate } from '../utils/format'

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

describe('formatBytes', () => {
  it('keeps small sizes in bytes', () => {
    expect(formatBytes(0)).toBe('0 Б')
    expect(formatBytes(1023)).toBe('1023 Б')
  })

  it('switches to kilobytes at 1024 bytes', () => {
    expect(formatBytes(1024)).toBe('1 КБ')
    expect(formatBytes(1536)).toBe('1.5 КБ')
  })

  it('switches to megabytes and gigabytes', () => {
    expect(formatBytes(2_938_475)).toBe('2.8 МБ')
    expect(formatBytes(1024 ** 3)).toBe('1 ГБ')
  })
})
