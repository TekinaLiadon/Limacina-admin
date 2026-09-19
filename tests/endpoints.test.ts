import { describe, it, expect } from 'vitest'
import { ApiEndpoint, endpointUrl } from '~/api/endpoints'

describe('apiEndpoint', () => {
  it('has unique paths', () => {
    const paths = Object.values(ApiEndpoint)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('all endpoints are under /v1', () => {
    for (const path of Object.values(ApiEndpoint)) {
      expect(path.startsWith('/v1/')).toBeTruthy()
    }
  })

  it('template endpoints declare path params', () => {
    expect(ApiEndpoint.AdminUser).toBe('/v1/panel/users/:username')
    expect(ApiEndpoint.AdminUserRestore).toBe('/v1/panel/users/:username/restore')
  })

  it('exposes updater release endpoints', () => {
    expect(ApiEndpoint.AdminLauncherRelease).toBe('/v1/panel/launcher/release')
    expect(ApiEndpoint.LauncherLatest).toBe('/v1/launcher/update/latest')
    expect(ApiEndpoint.LauncherReleases).toBe('/v1/launcher/update/releases')
  })

  it('exposes rcon endpoints', () => {
    expect(ApiEndpoint.ServerRconStatus).toBe('/v1/panel/server/rcon')
    expect(ApiEndpoint.ServerRconCommands).toBe('/v1/panel/server/rcon/commands')
    expect(ApiEndpoint.ServerRconExecute).toBe('/v1/panel/server/rcon/execute')
  })
})

describe('endpointUrl', () => {
  it('substitutes a single path param', () => {
    expect(endpointUrl(ApiEndpoint.AdminUser, { username: 'john' })).toBe('/v1/panel/users/john')
  })

  it('substitutes params in the restore endpoint', () => {
    expect(endpointUrl(ApiEndpoint.AdminUserRestore, { username: 'john' })).toBe('/v1/panel/users/john/restore')
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
