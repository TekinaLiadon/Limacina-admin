import { describe, it, expect } from 'vitest'
import { isPage } from '~/api/types'

describe('isPage', () => {
  it('accepts a valid page', () => {
    expect(isPage({ items: [], total: 0, limit: 10, offset: 0 })).toBe(true)
    expect(isPage({ items: [{ username: 'john' }], total: 1, limit: 10, offset: 0 })).toBe(true)
  })

  it('rejects a plain array (legacy response shape)', () => {
    expect(isPage([{ username: 'john' }])).toBe(false)
  })

  it('rejects objects without items', () => {
    expect(isPage({ total: 1 })).toBe(false)
    expect(isPage({ items: 'not-an-array', total: 1 })).toBe(false)
  })

  it('rejects objects without numeric total', () => {
    expect(isPage({ items: [] })).toBe(false)
    expect(isPage({ items: [], total: '5' })).toBe(false)
  })

  it('rejects null and primitives', () => {
    expect(isPage(null)).toBe(false)
    expect(isPage(undefined)).toBe(false)
    expect(isPage(0)).toBe(false)
    expect(isPage('items')).toBe(false)
  })
})
