import { describe, it, expect } from 'vitest'
import { navItems, navTitles } from '~/utils/nav'

describe('navItems', () => {
  it('lists every navigation target with a label', () => {
    for (const item of navItems) {
      expect(item.path).toMatch(/^\/[a-z-]+$/u)
      expect(item.label.length).toBeGreaterThan(0)
    }
  })

  it('keeps a title for every nav item', () => {
    for (const item of navItems) {
      expect(navTitles[item.path]).toBeDefined()
    }
  })

  it('hides deleted and server pages from non-owners', () => {
    const ownerOnly = navItems.filter((item) => item.ownerOnly).map((item) => item.path)

    expect(ownerOnly).toStrictEqual(['/deleted', '/server'])
  })

  it('marks only notifications as disabled', () => {
    const disabled = navItems.filter((item) => item.disabled).map((item) => item.path)

    expect(disabled).toStrictEqual(['/notifications'])
  })
})
