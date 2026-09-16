export interface AuthTokens {
  access_token: string
  refresh_token: string
}

export interface AuthResponse {
  tokens: AuthTokens
  uuid: string
  username: string
  role: string
}

export interface InitOwnerRequest {
  token: string
  username: string
  password: string
}

export interface Page<TItem> {
  items: TItem[]
  total: number
  limit: number
  offset: number
}

export const isPage = <TItem>(value: unknown): value is Page<TItem> =>
  typeof value === 'object' && value !== null &&
  Array.isArray((value as Page<TItem>).items) &&
  typeof (value as Page<TItem>).total === 'number'

export const PAGE_FORMAT_ERROR = 'API вернул некорректные данные'

export interface UserListItem {
  uuid: string
  username: string
  role: string
  approved: boolean
  banned: boolean
}

export interface DeletedUserListItem {
  username: string
  role: string
  approved: boolean
  banned: boolean
  deletedAt: string
}

export interface LogPage {
  date: string
  offset: number
  limit: number
  total: number
  lines: string[]
}

export interface UpdaterPlatformRelease {
  url: string
  signature: string
}

export interface UpdaterLatest {
  version: string
  pub_date: string
  platforms: Record<string, UpdaterPlatformRelease>
}

export interface UpdaterReleaseInfo {
  version: string
  pubDate: string
  platforms: string[]
}

export interface UpdaterReleasesList {
  releases: UpdaterReleaseInfo[]
}

export const isUpdaterReleasesList = (value: unknown): value is UpdaterReleasesList =>
  typeof value === 'object' && value !== null &&
  Array.isArray((value as UpdaterReleasesList).releases)

export const UPDATER_FORMAT_ERROR = 'API вернул некорректные данные'

export interface LauncherReleasePublished {
  version: string
  published: string[]
}

export interface RebuildStatus {
  inProgress: boolean
  lastError: string | null
  revisionBefore: string | null
  revisionAfter: string | null
}

export interface LauncherConfig {
  projectName: string
  mcVersion: string
  modLoader: string
  loaderVersion: string
  jvmArgs: string[]
  minMemory: string
  maxMemory: string
  online: boolean
}
