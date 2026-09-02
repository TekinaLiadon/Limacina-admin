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

export interface Page<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}

export const isPage = <T>(value: unknown): value is Page<T> =>
  typeof value === 'object' && value !== null &&
  Array.isArray((value as Page<T>).items) &&
  typeof (value as Page<T>).total === 'number'

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

export interface LauncherPlatform {
  os: string
  arch: string
}

export interface LauncherVersionInfo {
  version: string
  platforms: LauncherPlatform[]
}

export interface LauncherVersion {
  version: string
  platforms: LauncherPlatform[]
  versions: LauncherVersionInfo[]
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
