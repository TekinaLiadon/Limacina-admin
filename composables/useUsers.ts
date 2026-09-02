import { ApiEndpoint, endpointUrl } from '~/api/endpoints'
import { isPage, PAGE_FORMAT_ERROR, type Page, type UserListItem } from '~/api/types'
import { clampPage, totalPagesOf } from '~/utils/pagination'
import { debounce } from '~/utils/debounce'

export type { UserListItem } from '~/api/types'

export const USERS_PER_PAGE = 20
const SEARCH_DEBOUNCE_MS = 400

export const useUsers = () => {
  const { get, patch, del } = useApi()

  const users = ref<UserListItem[]>([])
  const page = ref(1)
  const search = ref('')
  const total = ref(0)
  const loading = ref(true)
  const error = ref('')
  const acting = ref('')

  const totalPages = computed(() => totalPagesOf(total.value, USERS_PER_PAGE))

  const fetchUsers = async () => {
    loading.value = true
    error.value = ''

    try {
      const { data, error: err } = await get<Page<UserListItem>>(ApiEndpoint.AdminUsers, {
        limit: USERS_PER_PAGE,
        offset: (page.value - 1) * USERS_PER_PAGE,
        username: search.value.trim() || undefined,
      })

      if (err.value) {
        error.value = err.value
      } else if (isPage<UserListItem>(data.value)) {
        users.value = data.value.items
        total.value = data.value.total
        page.value = clampPage(page.value, totalPages.value)
      } else if (data.value) {
        error.value = PAGE_FORMAT_ERROR
      }
    } finally {
      loading.value = false
    }
  }

  const goToPage = (target: number) => {
    const next = clampPage(target, totalPages.value)
    if (next === page.value) return
    page.value = next
    fetchUsers()
  }

  const applySearch = debounce(() => {
    page.value = 1
    fetchUsers()
  }, SEARCH_DEBOUNCE_MS)

  watch(search, () => applySearch())
  onScopeDispose(applySearch.cancel)

  const applyUserUpdate = (username: string, changes: Partial<UserListItem>) => {
    users.value = users.value.map((u) => (u.username === username ? { ...u, ...changes } : u))
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
        if (users.value.length === 1 && page.value > 1) page.value -= 1
        await fetchUsers()
      }
    } finally {
      acting.value = ''
    }
  }

  return {
    users, page, search, total, totalPages, loading, error, acting,
    fetchUsers, goToPage, changeRole, changeApproved, changeBanned, deleteUser,
  }
}
