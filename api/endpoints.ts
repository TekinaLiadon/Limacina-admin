export enum ApiEndpoint {
  AuthLogin = '/v1/common/auth/login',
  AuthRefresh = '/v1/common/auth/refresh',
  AuthInvalidate = '/v1/common/auth/invalidate',
  InitOwner = '/v1/panel/users/init-owner',

  AdminUnapproved = '/v1/panel/users/unapproved',
  AdminApprove = '/v1/panel/users/approve',
  AdminUsers = '/v1/panel/users',
  AdminUser = '/v1/panel/users/:username',
  AdminRole = '/v1/panel/users/role',
  AdminBan = '/v1/panel/users/ban',
  AdminLogs = '/v1/panel/logs',
  AdminLogDates = '/v1/panel/logs/dates',
  AdminLauncher = '/v1/panel/launcher',
  AdminConfig = '/v1/panel/launcher/config',

  LauncherVersion = '/v1/launcher/update/version',
  LauncherConfig = '/v1/launcher/config',
  LauncherDownload = '/v1/launcher/update/:os/:arch/download',
}

export const endpointUrl = (endpoint: string, params: Record<string, string>) =>
  endpoint.replace(/:(\w+)/g, (_, key: string) => {
    const value = params[key]
    if (value === undefined) {
      throw new Error(`Missing path param "${key}" for endpoint "${endpoint}"`)
    }
    return encodeURIComponent(value)
  })
