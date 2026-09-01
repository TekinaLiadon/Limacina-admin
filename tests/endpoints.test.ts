import { describe, it, expect } from 'vitest'
import { ApiEndpoint, endpointUrl } from '~/api/endpoints'

describe('ApiEndpoint', () => {
  it('has unique paths', () => {
    const paths = Object.values(ApiEndpoint)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('all endpoints are under /v1', () => {
    for (const path of Object.values(ApiEndpoint)) {
      expect(path.startsWith('/v1/')).toBe(true)
    }
  })

  it('template endpoints declare path params', () => {
    expect(ApiEndpoint.AdminUser).toBe('/v1/panel/users/:username')
    expect(ApiEndpoint.LauncherDownload).toBe('/v1/launcher/update/:os/:arch/download')
  })
})

describe('endpointUrl', () => {
  it('substitutes a single path param', () => {
    expect(endpointUrl(ApiEndpoint.AdminUser, { username: 'john' })).toBe('/v1/panel/users/john')
  })

  it('substitutes multiple path params', () => {
    expect(endpointUrl(ApiEndpoint.LauncherDownload, { os: 'linux', arch: 'x86_64' }))
      .toBe('/v1/launcher/update/linux/x86_64/download')
  })

  it('encodes path param values', () => {
    expect(endpointUrl(ApiEndpoint.AdminUser, { username: 'a b/c' })).toBe('/v1/panel/users/a%20b%2Fc')
  })

  it('leaves endpoints without params untouched', () => {
    expect(endpointUrl(ApiEndpoint.AdminUsers, {})).toBe('/v1/panel/users')
  })

  it('throws when a path param is missing', () => {
    expect(() => endpointUrl(ApiEndpoint.AdminUser, {})).toThrow('username')
  })
})
