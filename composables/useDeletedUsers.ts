import { ApiEndpoint, endpointUrl } from '~/api/endpoints'
import type { DeletedUserListItem, Page } from '~/api/types'
import { clampPage, totalPagesOf } from '~/utils/pagination'
import { debounce } from '~/utils/debounce'

export type { DeletedUserListItem } from '~/api/types'

export const DELETED_PER_PAGE = 10
const SEARCH_DEBOUNCE_MS = 400

export const useDeletedUsers = () => {
  const { get, patch } = useApi()

  const users = ref<DeletedUserListItem[]>([])
  const page = ref(1)
  const search = ref('')
  const total = ref(0)
  const loading = ref(true)
  const error = ref('')
  const restoring = ref('')

  const totalPages = computed(() => totalPagesOf(total.value, DELETED_PER_PAGE))

  const fetchUsers = async () => {
    loading.value = true
    error.value = ''

    try {
      const { data, error: err } = await get<Page<DeletedUserListItem>>(ApiEndpoint.AdminDeletedUsers, {
        limit: DELETED_PER_PAGE,
        offset: (page.value - 1) * DELETED_PER_PAGE,
        username: search.value.trim() || undefined,
      })

      if (err.value) {
        error.value = err.value
      } else if (data.value) {
        users.value = data.value.items
        total.value = data.value.total
        page.value = clampPage(page.value, totalPages.value)
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

  const restoreUser = async (username: string) => {
    restoring.value = username
    error.value = ''

    try {
      const { error: err } = await patch(endpointUrl(ApiEndpoint.AdminUserRestore, { username }))

      if (err.value) {
        error.value = err.value
      } else {
        if (users.value.length === 1 && page.value > 1) page.value -= 1
        await fetchUsers()
      }
    } finally {
      restoring.value = ''
    }
  }

  return {
    users, page, search, total, totalPages, loading, error, restoring,
    fetchUsers, goToPage, restoreUser,
  }
}
