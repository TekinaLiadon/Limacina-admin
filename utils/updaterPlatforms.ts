export interface UpdaterPlatform {
  key: string
  os: string
  arch: string
  artifactExt: string
}

export const UPDATER_PLATFORMS: UpdaterPlatform[] = [
  { key: 'windows-x86_64', os: 'Windows', arch: 'x86_64', artifactExt: '.exe' },
  { key: 'linux-x86_64', os: 'Linux', arch: 'x86_64', artifactExt: '.AppImage' },
  { key: 'linux-aarch64', os: 'Linux', arch: 'aarch64', artifactExt: '.AppImage' },
  { key: 'darwin-aarch64', os: 'macOS', arch: 'arm64', artifactExt: '.app.tar.gz' },
]

export const updaterPlatformLabel = (key: string): string => {
  const platform = UPDATER_PLATFORMS.find((candidate) => candidate.key === key)
  if (!platform) return key
  return `${platform.os} ${platform.arch}`
}

export const RELEASE_VERSION_PATTERN = /^\d+\.\d+\.\d+$/u

export interface ReleasePairForm {
  artifact: File | null
  signature: File | null
}

export const isCompleteReleasePair = (pair: ReleasePairForm): boolean =>
  pair.artifact !== null && pair.signature !== null

const isTouchedReleasePair = (pair: ReleasePairForm): boolean =>
  pair.artifact !== null || pair.signature !== null

export const validateReleaseForm = (
  version: string,
  pairs: Record<string, ReleasePairForm>,
): string => {
  if (!RELEASE_VERSION_PATTERN.test(version)) return 'Версия должна быть в формате x.x.x'
  const complete = Object.values(pairs).filter((pair) => isCompleteReleasePair(pair)).length
  const touched = Object.values(pairs).filter((pair) => isTouchedReleasePair(pair)).length
  if (touched > complete) return 'Для каждой выбранной платформы нужны и артефакт, и подпись .sig'
  if (complete === 0) return 'Выберите файлы хотя бы для одной платформы'
  return ''
}

export const buildReleaseFormData = (
  version: string,
  pairs: Record<string, ReleasePairForm>,
): FormData => {
  const formData = new FormData()
  formData.append('version', version)
  for (const platform of UPDATER_PLATFORMS) {
    const pair = pairs[platform.key]
    if (pair?.artifact && pair.signature) {
      formData.append(platform.key, pair.artifact)
      formData.append(`${platform.key}_sig`, pair.signature)
    }
  }
  return formData
}
