import { ApiEndpoint } from '~/api/endpoints'
import type { UserListItem } from '~/api/types'

export const UNAPPROVED_PER_PAGE = 10

interface UnapprovedUsersState {
  users: Ref<UserListItem[]>
  page: Ref<number>
  total: Ref<number>
  totalPages: ComputedRef<number>
  error: Ref<string>
  actionError: Ref<string>
  loading: Ref<boolean>
  approving: Ref<string>
  fetchUsers: () => Promise<void>
  goToPage: (target: number) => void
  approveUser: (username: string) => Promise<void>
}

export const useUnapprovedUsers = (): UnapprovedUsersState => {
  const { patch } = useApi()

  const {
    users, page, total, totalPages, loading, error, actionError,
    fetchUsers, goToPage, refetchAfterRemoval, runUserAction,
  } = useUsersList<UserListItem>({
    endpoint: ApiEndpoint.AdminUsers,
    perPage: UNAPPROVED_PER_PAGE,
    query: () => ({ approved: false }),
  })

  const approving = ref('')

  const approveUser = (username: string): Promise<void> =>
    runUserAction(
      username,
      approving,
      () => patch(ApiEndpoint.AdminApprove, { username, approved: true }),
      refetchAfterRemoval,
    )

  return {
    users, page, total, totalPages, error, actionError, loading, approving,
    fetchUsers, goToPage, approveUser,
  }
}
