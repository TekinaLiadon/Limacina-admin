import { describe, expect, it } from 'vitest'
import { clampPage, pageNumbers, totalPagesOf } from '~/utils/pagination'

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
    expect(pageNumbers(1, 5)).toStrictEqual([1, 2, 3, 4, 5])
  })

  it('collapses middle pages with ellipsis', () => {
    expect(pageNumbers(5, 20)).toStrictEqual([1, '...', 4, 5, 6, '...', 20])
  })

  it('keeps leading pages when current is near start', () => {
    expect(pageNumbers(2, 20)).toStrictEqual([1, 2, 3, '...', 20])
  })

  it('keeps trailing pages when current is near end', () => {
    expect(pageNumbers(19, 20)).toStrictEqual([1, '...', 18, 19, 20])
  })
})
