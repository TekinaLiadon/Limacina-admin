export enum ApiEndpoint {
  AuthLogin = '/auth/login',
  AuthRefresh = '/auth/refresh',
  AuthInvalidate = '/auth/invalidate',
  InitOwner = '/technical/init-owner',

  AdminUnapproved = '/admin/unapproved',
  AdminApprove = '/admin/approve',
  AdminUsers = '/admin/users',
  AdminUser = '/admin/users/:username',
  AdminRole = '/admin/role',
  AdminBan = '/admin/ban',
  AdminLogs = '/admin/logs',
  AdminLogDates = '/admin/logs/dates',
  AdminLauncher = '/admin/launcher',
  AdminConfig = '/admin/config',

  LauncherVersion = '/launcher/version',
  LauncherConfig = '/launcher/config',
  LauncherDownload = '/launcher/:os/:arch/download',
}

export const endpointUrl = (endpoint: string, params: Record<string, string>) =>
  endpoint.replace(/:(\w+)/g, (_, key: string) => {
    const value = params[key]
    if (value === undefined) {
      throw new Error(`Missing path param "${key}" for endpoint "${endpoint}"`)
    }
    return encodeURIComponent(value)
  })
