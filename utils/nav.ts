export interface NavItem {
  path: string
  label: string
  icon: string
  disabled?: boolean
}

export const navItems: NavItem[] = [
  { path: '/unapproved', label: 'Неодобренные', icon: '⏳' },
  { path: '/users', label: 'Пользователи', icon: '👥' },
  { path: '/notifications', label: 'Нотификации', icon: '🔔', disabled: true },
  { path: '/releases', label: 'Релизы', icon: '📦' },
  { path: '/logs', label: 'Логи', icon: '📋' },
]

export const navTitles: Record<string, string> = {
  '/unapproved': 'Неодобренные пользователи',
  '/users': 'Пользователи',
  '/notifications': 'Нотификации',
  '/releases': 'Релизы',
  '/logs': 'Логи',
}
