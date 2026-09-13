import { ApiEndpoint, endpointUrl } from '~/api/endpoints'
import type { UserListItem } from '~/api/types'

export type { UserListItem } from '~/api/types'

export const USERS_PER_PAGE = 20

export const useUsers = () => {
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

  const applyUserUpdate = (username: string, changes: Partial<UserListItem>) => {
    users.value = users.value.map((u) => (u.username === username ? { ...u, ...changes } : u))
  }

  const mutateUser = (
    user: UserListItem,
    changes: Partial<UserListItem>,
    path: ApiEndpoint,
    body: Record<string, unknown>,
  ) =>
    runUserAction(
      user.username,
      acting,
      () => patch(path, body),
      () => applyUserUpdate(user.username, changes),
    )

  const changeRole = (user: UserListItem, newRole: string) => {
    if (newRole === user.role) return
    return mutateUser(user, { role: newRole }, ApiEndpoint.AdminRole, {
      username: user.username,
      role: newRole,
    })
  }

  const changeApproved = (user: UserListItem, approved: boolean) => {
    if (approved === user.approved) return
    return mutateUser(user, { approved }, ApiEndpoint.AdminApprove, {
      username: user.username,
      approved,
    })
  }

  const changeBanned = (user: UserListItem, banned: boolean) => {
    if (banned === user.banned) return
    return mutateUser(user, { banned }, ApiEndpoint.AdminBan, {
      username: user.username,
      banned,
    })
  }

  const deleteUser = (username: string) =>
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
