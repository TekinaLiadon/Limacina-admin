import { describe, it, expect } from 'vitest'
import { ApiEndpoint, endpointUrl } from '~/api/endpoints'

describe('ApiEndpoint', () => {
  it('has unique paths', () => {
    const paths = Object.values(ApiEndpoint)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('template endpoints declare path params', () => {
    expect(ApiEndpoint.AdminUser).toBe('/admin/users/:username')
    expect(ApiEndpoint.LauncherDownload).toBe('/launcher/:os/:arch/download')
  })
})

describe('endpointUrl', () => {
  it('substitutes a single path param', () => {
    expect(endpointUrl(ApiEndpoint.AdminUser, { username: 'john' })).toBe('/admin/users/john')
  })

  it('substitutes multiple path params', () => {
    expect(endpointUrl(ApiEndpoint.LauncherDownload, { os: 'linux', arch: 'x86_64' }))
      .toBe('/launcher/linux/x86_64/download')
  })

  it('encodes path param values', () => {
    expect(endpointUrl(ApiEndpoint.AdminUser, { username: 'a b/c' })).toBe('/admin/users/a%20b%2Fc')
  })

  it('leaves endpoints without params untouched', () => {
    expect(endpointUrl(ApiEndpoint.AdminUsers, {})).toBe('/admin/users')
  })

  it('throws when a path param is missing', () => {
    expect(() => endpointUrl(ApiEndpoint.AdminUser, {})).toThrow('username')
  })
})
