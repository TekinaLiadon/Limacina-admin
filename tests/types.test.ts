import { describe, it, expect } from 'vitest'
import {
  isPage, isUpdaterReleasesList, isLauncherConfig,
  isRconStatus, isRconCommands, isRconOutput,
} from '~/api/types'

describe('isPage', () => {
  it('accepts an object with items and total', () => {
    expect(isPage({ items: [{ value: 1 }], total: 1, limit: 1, offset: 0 })).toBeTruthy()
  })

  it('rejects null and primitives', () => {
    expect(isPage(null)).toBeFalsy()
    expect(isPage('items')).toBeFalsy()
    expect(isPage(42)).toBeFalsy()
  })

  it('rejects an items value that is not an array', () => {
    expect(isPage({ items: 'not-an-array', total: 1 })).toBeFalsy()
  })

  it('rejects a total value that is not a number', () => {
    expect(isPage({ items: [], total: 'many' })).toBeFalsy()
  })
})

describe('isUpdaterReleasesList', () => {
  it('accepts an object with a releases array', () => {
    expect(isUpdaterReleasesList({ releases: [{ version: '1.0.0', pubDate: '2026-01-01', platforms: [] }] })).toBeTruthy()
  })

  it('rejects null and primitives', () => {
    expect(isUpdaterReleasesList(null)).toBeFalsy()
    expect(isUpdaterReleasesList(42)).toBeFalsy()
  })

  it('rejects a releases value that is not an array', () => {
    expect(isUpdaterReleasesList({ releases: 'nope' })).toBeFalsy()
  })

  it('rejects an object without releases', () => {
    expect(isUpdaterReleasesList({})).toBeFalsy()
  })
})

describe('isLauncherConfig', () => {
  const valid = {
    projectName: 'limacina',
    mcVersion: '1.20.1',
    modLoader: 'fabric',
    loaderVersion: '0.15.11',
    minMemory: '2G',
    maxMemory: '4G',
    online: true,
    jvmArgs: ['-Xmx4G'],
  }

  it('accepts a complete config', () => {
    expect(isLauncherConfig(valid)).toBeTruthy()
  })

  it('rejects null and primitives', () => {
    expect(isLauncherConfig(null)).toBeFalsy()
    expect(isLauncherConfig('config')).toBeFalsy()
  })

  it('rejects a config with a missing field', () => {
    expect(isLauncherConfig({ ...valid, modLoader: undefined })).toBeFalsy()
  })

  it('rejects a config with a wrong online type', () => {
    expect(isLauncherConfig({ ...valid, online: 'true' })).toBeFalsy()
  })

  it('rejects a config with jvmArgs that is not an array', () => {
    expect(isLauncherConfig({ ...valid, jvmArgs: '-Xmx4G' })).toBeFalsy()
  })
})

describe('isRconStatus', () => {
  it('accepts an object with a boolean enabled flag', () => {
    expect(isRconStatus({ enabled: true })).toBeTruthy()
    expect(isRconStatus({ enabled: false })).toBeTruthy()
  })

  it('rejects null, primitives and a wrong enabled type', () => {
    expect(isRconStatus(null)).toBeFalsy()
    expect(isRconStatus('enabled')).toBeFalsy()
    expect(isRconStatus({ enabled: 'yes' })).toBeFalsy()
    expect(isRconStatus({})).toBeFalsy()
  })
})

describe('isRconCommands', () => {
  it('accepts an object with a string array', () => {
    expect(isRconCommands({ commands: ['say', 'list'] })).toBeTruthy()
    expect(isRconCommands({ commands: [] })).toBeTruthy()
  })

  it('rejects null, primitives and non-string items', () => {
    expect(isRconCommands(null)).toBeFalsy()
    expect(isRconCommands(42)).toBeFalsy()
    expect(isRconCommands({ commands: 'say' })).toBeFalsy()
    expect(isRconCommands({ commands: ['say', 42] })).toBeFalsy()
    expect(isRconCommands({})).toBeFalsy()
  })
})

describe('isRconOutput', () => {
  it('accepts an object with a string output', () => {
    expect(isRconOutput({ output: 'Сервер: hello' })).toBeTruthy()
    expect(isRconOutput({ output: '' })).toBeTruthy()
  })

  it('rejects null, primitives and a wrong output type', () => {
    expect(isRconOutput(null)).toBeFalsy()
    expect(isRconOutput({})).toBeFalsy()
    expect(isRconOutput({ output: 42 })).toBeFalsy()
  })
})
