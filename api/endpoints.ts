export enum ApiEndpoint {
  AuthLogin = '/v1/common/auth/login',
  AuthRefresh = '/v1/common/auth/refresh',
  AuthInvalidate = '/v1/common/auth/invalidate',
  InitOwner = '/v1/panel/users/init-owner',

  AdminUsers = '/v1/panel/users',
  AdminUser = '/v1/panel/users/:username',
  AdminUserRestore = '/v1/panel/users/:username/restore',
  AdminDeletedUsers = '/v1/panel/users/deleted',
  AdminApprove = '/v1/panel/users/approve',
  AdminRole = '/v1/panel/users/role',
  AdminSetOwner = '/v1/panel/users/owner',
  AdminBan = '/v1/panel/users/ban',
  AdminUserPassword = '/v1/panel/users/password',
  AdminLogs = '/v1/panel/logs',
  AdminLogDates = '/v1/panel/logs/dates',
  AdminLauncherRelease = '/v1/panel/launcher/release',
  AdminConfig = '/v1/panel/launcher/config',
  ServerRestart = '/v1/panel/server/restart',
  ServerRebuildStatus = '/v1/panel/server/rebuild',
  ServerRconStatus = '/v1/panel/server/rcon',
  ServerRconCommands = '/v1/panel/server/rcon/commands',
  ServerRconExecute = '/v1/panel/server/rcon/execute',

  LauncherLatest = '/v1/launcher/update/latest',
  LauncherReleases = '/v1/launcher/update/releases',
  LauncherConfig = '/v1/launcher/config',
}

export const endpointUrl = (endpoint: string, params: Record<string, string>): string =>
  endpoint.replaceAll(/:(?<param>\w+)/gu, (_, key: string) => {
    const value = params[key]
    if (value === undefined) {
      throw new Error(`Missing path param "${key}" for endpoint "${endpoint}"`)
    }
    return encodeURIComponent(value)
  })
