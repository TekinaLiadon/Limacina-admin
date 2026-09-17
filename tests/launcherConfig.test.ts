import { describe, it, expect } from 'vitest'
import { isLauncherConfig, type LauncherConfig } from '~/api/types'

const validConfig = (): LauncherConfig => ({
  projectName: 'limacina',
  mcVersion: '1.20.1',
  modLoader: 'fabric',
  loaderVersion: '0.15.11',
  jvmArgs: ['-Xmx4G', '-Xms2G'],
  minMemory: '2G',
  maxMemory: '4G',
  online: true,
})

describe('isLauncherConfig', () => {
  it('accepts a valid config', () => {
    expect(isLauncherConfig(validConfig())).toBeTruthy()
    expect(isLauncherConfig({ ...validConfig(), jvmArgs: [] })).toBeTruthy()
  })

  it('ignores extra fields', () => {
    expect(isLauncherConfig({ ...validConfig(), extra: 'ignored' })).toBeTruthy()
  })

  it('rejects jvmArgs that is not an array', () => {
    expect(isLauncherConfig({ ...validConfig(), jvmArgs: '-Xmx4G -Xms2G' })).toBeFalsy()
    expect(isLauncherConfig({ ...validConfig(), jvmArgs: null })).toBeFalsy()
    expect(isLauncherConfig({ ...validConfig(), jvmArgs: { args: 1 } })).toBeFalsy()
  })

  it('rejects wrong field types', () => {
    expect(isLauncherConfig({ ...validConfig(), online: 'true' })).toBeFalsy()
    expect(isLauncherConfig({ ...validConfig(), projectName: 42 })).toBeFalsy()
    expect(isLauncherConfig({ ...validConfig(), minMemory: null })).toBeFalsy()
  })

  it('rejects objects with missing fields', () => {
    expect(isLauncherConfig({})).toBeFalsy()
    expect(isLauncherConfig({ ...validConfig(), jvmArgs: undefined })).toBeFalsy()
    expect(isLauncherConfig({ ...validConfig(), online: undefined })).toBeFalsy()
  })

  it('rejects null, arrays and primitives', () => {
    expect(isLauncherConfig(null)).toBeFalsy()
    expect(isLauncherConfig([])).toBeFalsy()
    expect(isLauncherConfig('config')).toBeFalsy()
    expect(isLauncherConfig(0)).toBeFalsy()
  })
})
