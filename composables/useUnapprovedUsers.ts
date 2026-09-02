import { ApiEndpoint } from '~/api/endpoints'
import type { Page, UserListItem } from '~/api/types'
import { clampPage, totalPagesOf } from '~/utils/pagination'

export const UNAPPROVED_PER_PAGE = 10

export const useUnapprovedUsers = () => {
  const { get, patch } = useApi()

  const users = ref<UserListItem[]>([])
  const page = ref(1)
  const total = ref(0)
  const error = ref('')
  const loading = ref(true)
  const approving = ref('')

  const totalPages = computed(() => totalPagesOf(total.value, UNAPPROVED_PER_PAGE))

  const fetchUsers = async () => {
    loading.value = true
    error.value = ''

    try {
      const { data, error: err } = await get<Page<UserListItem>>(ApiEndpoint.AdminUsers, {
        approved: false,
        limit: UNAPPROVED_PER_PAGE,
        offset: (page.value - 1) * UNAPPROVED_PER_PAGE,
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

  const approveUser = async (username: string) => {
    approving.value = username
    error.value = ''

    try {
      const res = await patch(ApiEndpoint.AdminApprove, { username, approved: true })
      if (res.error.value) {
        error.value = res.error.value
      } else {
        if (users.value.length === 1 && page.value > 1) page.value -= 1
        await fetchUsers()
      }
    } finally {
      approving.value = ''
    }
  }

  return {
    users, page, total, totalPages, error, loading, approving,
    fetchUsers, goToPage, approveUser,
  }
}
