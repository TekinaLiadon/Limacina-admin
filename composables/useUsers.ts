import { ApiEndpoint, endpointUrl } from '~/api/endpoints'
import type { UserListItem } from '~/api/types'

export type { UserListItem } from '~/api/types'

export const USERS_PER_PAGE = 20

interface UsersState {
  users: Ref<UserListItem[]>
  page: Ref<number>
  search: Ref<string>
  total: Ref<number>
  totalPages: ComputedRef<number>
  loading: Ref<boolean>
  error: Ref<string>
  acting: Ref<string>
  actionError: Ref<string>
  fetchUsers: () => Promise<void>
  goToPage: (target: number) => void
  changeRole: (user: UserListItem, newRole: string) => Promise<void> | undefined
  changeApproved: (user: UserListItem, approved: boolean) => Promise<void> | undefined
  changeBanned: (user: UserListItem, banned: boolean) => Promise<void> | undefined
  deleteUser: (username: string) => Promise<void>
}

export const useUsers = (): UsersState => {
  const { patch, del } = useApi()

  const {
    users, page, search, total, totalPages, loading, error, actionError,
    fetchUsers, goToPage, refetchAfterRemoval, runUserAction,
  } = useUsersList<UserListItem>({
    endpoint: ApiEndpoint.AdminUsers,
    perPage: USERS_PER_PAGE,
    withSearch: true,
  })

  const acting = ref('')

  const applyUserUpdate = (username: string, changes: Partial<UserListItem>): void => {
    users.value = users.value.map((user) => (user.username === username ? { ...user, ...changes } : user))
  }

  const mutateUser = (
    user: UserListItem,
    changes: Partial<UserListItem>,
    path: ApiEndpoint,
    body: Record<string, unknown>,
  ): Promise<void> =>
    runUserAction(
      user.username,
      acting,
      () => patch(path, body),
      () => applyUserUpdate(user.username, changes),
    )

  const changeRole = (user: UserListItem, newRole: string): Promise<void> | undefined => {
    if (newRole === user.role) return
    return mutateUser(user, { role: newRole }, ApiEndpoint.AdminRole, {
      username: user.username,
      role: newRole,
    })
  }

  const changeApproved = (user: UserListItem, approved: boolean): Promise<void> | undefined => {
    if (approved === user.approved) return
    return mutateUser(user, { approved }, ApiEndpoint.AdminApprove, {
      username: user.username,
      approved,
    })
  }

  const changeBanned = (user: UserListItem, banned: boolean): Promise<void> | undefined => {
    if (banned === user.banned) return
    return mutateUser(user, { banned }, ApiEndpoint.AdminBan, {
      username: user.username,
      banned,
    })
  }

  const deleteUser = (username: string): Promise<void> =>
    runUserAction(
      username,
      acting,
      () => del(endpointUrl(ApiEndpoint.AdminUser, { username })),
      refetchAfterRemoval,
    )

  return {
    users, page, search, total, totalPages, loading, error, acting, actionError,
    fetchUsers, goToPage, changeRole, changeApproved, changeBanned, deleteUser,
  }
}
