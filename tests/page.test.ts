import { describe, it, expect } from 'vitest'
import { isPage } from '~/api/types'

describe('isPage', () => {
  it('accepts a valid page', () => {
    expect(isPage({ items: [], total: 0, limit: 10, offset: 0 })).toBeTruthy()
    expect(isPage({ items: [{ username: 'john' }], total: 1, limit: 10, offset: 0 })).toBeTruthy()
  })

  it('rejects a plain array (legacy response shape)', () => {
    expect(isPage([{ username: 'john' }])).toBeFalsy()
  })

  it('rejects objects without items', () => {
    expect(isPage({ total: 1 })).toBeFalsy()
    expect(isPage({ items: 'not-an-array', total: 1 })).toBeFalsy()
  })

  it('rejects objects without numeric total', () => {
    expect(isPage({ items: [] })).toBeFalsy()
    expect(isPage({ items: [], total: '5' })).toBeFalsy()
  })

  it('rejects null and primitives', () => {
    expect(isPage(null)).toBeFalsy()
    expect(isPage(0)).toBeFalsy()
    expect(isPage('items')).toBeFalsy()
  })
})
