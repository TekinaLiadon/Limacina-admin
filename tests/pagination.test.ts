import { describe, expect, it } from 'vitest'
import { clampPage, pageNumbers, slicePage, totalPagesOf } from '~/utils/pagination'

describe('totalPagesOf', () => {
  it('returns 0 for empty total', () => {
    expect(totalPagesOf(0, 20)).toBe(0)
  })

  it('computes full pages', () => {
    expect(totalPagesOf(40, 20)).toBe(2)
  })

  it('rounds up partial pages', () => {
    expect(totalPagesOf(41, 20)).toBe(3)
  })
})

describe('clampPage', () => {
  it('keeps page in range', () => {
    expect(clampPage(2, 5)).toBe(2)
  })

  it('clamps to last page', () => {
    expect(clampPage(9, 5)).toBe(5)
  })

  it('clamps to first page', () => {
    expect(clampPage(0, 5)).toBe(1)
  })

  it('returns 1 when there are no pages', () => {
    expect(clampPage(3, 0)).toBe(1)
  })
})

describe('pageNumbers', () => {
  it('lists all pages when total is small', () => {
    expect(pageNumbers(1, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('collapses middle pages with ellipsis', () => {
    expect(pageNumbers(5, 20)).toEqual([1, '...', 4, 5, 6, '...', 20])
  })

  it('keeps leading pages when current is near start', () => {
    expect(pageNumbers(2, 20)).toEqual([1, 2, 3, '...', 20])
  })

  it('keeps trailing pages when current is near end', () => {
    expect(pageNumbers(19, 20)).toEqual([1, '...', 18, 19, 20])
  })
})

describe('slicePage', () => {
  it('slices the requested page', () => {
    const items = [1, 2, 3, 4, 5]
    expect(slicePage(items, 1, 2)).toEqual([1, 2])
    expect(slicePage(items, 2, 2)).toEqual([3, 4])
    expect(slicePage(items, 3, 2)).toEqual([5])
  })

  it('returns empty slice beyond the end', () => {
    expect(slicePage([1, 2], 5, 2)).toEqual([])
  })
})
