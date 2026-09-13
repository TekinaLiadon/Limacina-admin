import { ApiEndpoint } from '~/api/endpoints'
import type { UserListItem } from '~/api/types'

export const UNAPPROVED_PER_PAGE = 10

export const useUnapprovedUsers = () => {
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

  const approveUser = (username: string) =>
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
