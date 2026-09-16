export interface NavItem {
  path: string
  label: string
  disabled?: boolean
  ownerOnly?: boolean
}

export const navItems: NavItem[] = [
  { path: '/unapproved', label: 'Неодобренные' },
  { path: '/users', label: 'Пользователи' },
  { path: '/notifications', label: 'Нотификации', disabled: true },
  { path: '/releases', label: 'Релизы' },
  { path: '/logs', label: 'Логи' },
  { path: '/deleted', label: 'Удалённые', ownerOnly: true },
  { path: '/server', label: 'Сервер', ownerOnly: true },
]

export const navTitles: Record<string, string> = {
  '/unapproved': 'Неодобренные пользователи',
  '/users': 'Пользователи',
  '/notifications': 'Нотификации',
  '/releases': 'Релизы',
  '/logs': 'Логи',
  '/deleted': 'Удалённые пользователи',
  '/server': 'Сервер',
}
