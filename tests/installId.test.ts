import { describe, it, expect } from 'vitest'
import { normalizeInstallIdSearch, sanitizeInstallIdInput } from '~/utils/installId'

describe('normalizeInstallIdSearch', () => {
  it('keeps a valid install id', () => {
    expect(normalizeInstallIdSearch('v1-0123456789abcdef0123456789abcdef')).toBe(
      'v1-0123456789abcdef0123456789abcdef',
    )
  })

  it('accepts a partial id', () => {
    expect(normalizeInstallIdSearch('v1-ab')).toBe('v1-ab')
  })

  it('trims surrounding whitespace', () => {
    expect(normalizeInstallIdSearch('  v1-abc  ')).toBe('v1-abc')
  })

  it('rejects an empty value', () => {
    expect(normalizeInstallIdSearch('   ')).toBe('')
  })

  it('rejects characters outside the install id alphabet', () => {
    expect(normalizeInstallIdSearch('v1-zzz')).toBe('')
  })

  it('rejects an id longer than 35 characters', () => {
    expect(normalizeInstallIdSearch(`v1-${'a'.repeat(33)}`)).toBe('')
  })
})

describe('sanitizeInstallIdInput', () => {
  it('drops characters outside the install id alphabet', () => {
    expect(sanitizeInstallIdInput('v1-AB!@#c_ 12')).toBe('v1-ABc12')
  })

  it('caps the value at 35 characters', () => {
    expect(sanitizeInstallIdInput('a'.repeat(40))).toHaveLength(35)
  })

  it('keeps a valid value untouched', () => {
    expect(sanitizeInstallIdInput('v1-abc')).toBe('v1-abc')
  })
})
