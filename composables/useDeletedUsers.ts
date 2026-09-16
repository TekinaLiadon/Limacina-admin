import { ApiEndpoint, endpointUrl } from '~/api/endpoints'
import type { DeletedUserListItem } from '~/api/types'

export type { DeletedUserListItem } from '~/api/types'

export const DELETED_PER_PAGE = 10

interface DeletedUsersState {
  users: Ref<DeletedUserListItem[]>
  page: Ref<number>
  search: Ref<string>
  total: Ref<number>
  totalPages: ComputedRef<number>
  loading: Ref<boolean>
  error: Ref<string>
  restoring: Ref<string>
  actionError: Ref<string>
  fetchUsers: () => Promise<void>
  goToPage: (target: number) => void
  restoreUser: (username: string) => Promise<void>
}

export const useDeletedUsers = (): DeletedUsersState => {
  const { patch } = useApi()

  const {
    users, page, search, total, totalPages, loading, error, actionError,
    fetchUsers, goToPage, refetchAfterRemoval, runUserAction,
  } = useUsersList<DeletedUserListItem>({
    endpoint: ApiEndpoint.AdminDeletedUsers,
    perPage: DELETED_PER_PAGE,
    withSearch: true,
  })

  const restoring = ref('')

  const restoreUser = (username: string): Promise<void> =>
    runUserAction(
      username,
      restoring,
      () => patch(endpointUrl(ApiEndpoint.AdminUserRestore, { username })),
      refetchAfterRemoval,
    )

  return {
    users, page, search, total, totalPages, loading, error, restoring, actionError,
    fetchUsers, goToPage, restoreUser,
  }
}
