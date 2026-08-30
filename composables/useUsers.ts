import { ApiEndpoint, endpointUrl } from '~/api/endpoints'
import type { UserListItem } from '~/api/types'
import { clampPage, slicePage, totalPagesOf } from '~/utils/pagination'

export type { UserListItem } from '~/api/types'

export const USERS_PER_PAGE = 20

export const useUsers = () => {
  const { get, patch, del } = useApi()

  const allUsers = ref<UserListItem[]>([])
  const page = ref(1)
  const loading = ref(true)
  const error = ref('')
  const acting = ref('')

  const users = computed(() => slicePage(allUsers.value, page.value, USERS_PER_PAGE))
  const total = computed(() => allUsers.value.length)
  const totalPages = computed(() => totalPagesOf(total.value, USERS_PER_PAGE))

  const fetchUsers = async () => {
    loading.value = true
    error.value = ''

    try {
      const { data, error: err } = await get<UserListItem[]>(ApiEndpoint.AdminUsers, { limit: 100 })

      if (err.value) {
        error.value = err.value
      } else if (data.value) {
        allUsers.value = data.value
        page.value = clampPage(page.value, totalPages.value)
      }
    } finally {
      loading.value = false
    }
  }

  const goToPage = (target: number) => {
    page.value = clampPage(target, totalPages.value)
  }

  const applyUserUpdate = (username: string, changes: Partial<UserListItem>) => {
    allUsers.value = allUsers.value.map((u) => (u.username === username ? { ...u, ...changes } : u))
  }

  const mutateUser = async (
    user: UserListItem,
    changes: Partial<UserListItem>,
    path: ApiEndpoint,
    body: Record<string, unknown>,
  ) => {
    acting.value = user.username

    try {
      const { error: err } = await patch(path, body)

      if (err.value) {
        error.value = err.value
      } else {
        applyUserUpdate(user.username, changes)
      }
    } finally {
      acting.value = ''
    }
  }

  const changeRole = async (user: UserListItem, newRole: string) => {
    if (newRole === user.role) return
    await mutateUser(user, { role: newRole }, ApiEndpoint.AdminRole, {
      username: user.username,
      role: newRole,
    })
  }

  const changeApproved = async (user: UserListItem, approved: boolean) => {
    if (approved === user.approved) return
    await mutateUser(user, { approved }, ApiEndpoint.AdminApprove, {
      username: user.username,
      approved,
    })
  }

  const changeBanned = async (user: UserListItem, banned: boolean) => {
    if (banned === user.banned) return
    await mutateUser(user, { banned }, ApiEndpoint.AdminBan, {
      username: user.username,
      banned,
    })
  }

  const deleteUser = async (username: string) => {
    acting.value = username

    try {
      const { error: err } = await del(endpointUrl(ApiEndpoint.AdminUser, { username }))

      if (err.value) {
        error.value = err.value
      } else {
        allUsers.value = allUsers.value.filter((u) => u.username !== username)
        page.value = clampPage(page.value, totalPages.value)
      }
    } finally {
      acting.value = ''
    }
  }

  return {
    users, page, total, totalPages, loading, error, acting,
    fetchUsers, goToPage, changeRole, changeApproved, changeBanned, deleteUser,
  }
}
