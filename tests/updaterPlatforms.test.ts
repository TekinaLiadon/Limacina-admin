import { describe, it, expect } from 'vitest'
import {
  UPDATER_PLATFORMS,
  updaterPlatformLabel,
  validateReleaseForm,
  buildReleaseFormData,
  type ReleasePairForm,
} from '~/utils/updaterPlatforms'

const file = (name: string): File => new File(['x'], name, { type: 'application/octet-stream' })

const pair = (artifact: File | null, signature: File | null): ReleasePairForm => ({
  artifact,
  signature,
})

describe('updaterPlatforms', () => {
  it('matches the backend tauri platform keys', () => {
    expect(UPDATER_PLATFORMS.map((platform) => platform.key)).toStrictEqual([
      'windows-x86_64',
      'linux-x86_64',
      'linux-aarch64',
      'darwin-aarch64',
    ])
  })

  it('uses updater artifact suffixes per os', () => {
    const suffixes = Object.fromEntries(UPDATER_PLATFORMS.map((platform) => [platform.key, platform.artifactExt]))
    expect(suffixes['windows-x86_64']).toBe('.exe')
    expect(suffixes['linux-x86_64']).toBe('.AppImage')
    expect(suffixes['linux-aarch64']).toBe('.AppImage')
    expect(suffixes['darwin-aarch64']).toBe('.app.tar.gz')
  })
})

describe('updaterPlatformLabel', () => {
  it('labels known keys with display os', () => {
    expect(updaterPlatformLabel('windows-x86_64')).toBe('Windows x86_64')
    expect(updaterPlatformLabel('linux-aarch64')).toBe('Linux aarch64')
    expect(updaterPlatformLabel('darwin-aarch64')).toBe('macOS arm64')
  })

  it('passes unknown keys through', () => {
    expect(updaterPlatformLabel('freebsd-riscv64')).toBe('freebsd-riscv64')
  })
})

describe('validateReleaseForm', () => {
  it('requires x.x.x version', () => {
    const pairs = { 'windows-x86_64': pair(file('a.exe'), file('a.exe.sig')) }
    expect(validateReleaseForm('1.0', pairs)).toContain('x.x.x')
    expect(validateReleaseForm('v1.0.0', pairs)).toContain('x.x.x')
    expect(validateReleaseForm('1.0.0', pairs)).toBe('')
  })

  it('requires at least one complete pair', () => {
    const pairs = { 'windows-x86_64': pair(null, null) }
    expect(validateReleaseForm('1.0.0', pairs)).toContain('хотя бы')
  })

  it('rejects incomplete pairs', () => {
    const pairs = {
      'windows-x86_64': pair(file('a.exe'), null),
      'linux-x86_64': pair(file('b.AppImage'), file('b.AppImage.sig')),
    }
    expect(validateReleaseForm('1.0.0', pairs)).toContain('подпись')
  })
})

describe('buildReleaseFormData', () => {
  it('appends version and complete pairs only', () => {
    const pairs = {
      'windows-x86_64': pair(file('a.exe'), file('a.exe.sig')),
      'linux-x86_64': pair(null, file('b.AppImage.sig')),
      'linux-aarch64': pair(null, null),
      'darwin-aarch64': pair(file('c.app.tar.gz'), file('c.app.tar.gz.sig')),
    }

    const formData = buildReleaseFormData('1.2.3', pairs)

    expect(formData.get('version')).toBe('1.2.3')
    expect(formData.get('windows-x86_64')).toBeInstanceOf(File)
    expect(formData.get('windows-x86_64_sig')).toBeInstanceOf(File)
    expect(formData.get('linux-x86_64')).toBeNull()
    expect(formData.get('linux-x86_64_sig')).toBeNull()
    expect(formData.get('linux-aarch64')).toBeNull()
    expect(formData.get('darwin-aarch64')).toBeInstanceOf(File)
    expect(formData.get('darwin-aarch64_sig')).toBeInstanceOf(File)
  })
})
