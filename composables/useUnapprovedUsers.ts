import { ApiEndpoint } from '~/api/endpoints'
import type { UnapprovedUser } from '~/api/types'
import { clampPage, slicePage, totalPagesOf } from '~/utils/pagination'

export const UNAPPROVED_PER_PAGE = 10

export const useUnapprovedUsers = () => {
  const { get, patch } = useApi()

  const allUsers = ref<UnapprovedUser[]>([])
  const page = ref(1)
  const error = ref('')
  const loading = ref(true)
  const approving = ref('')

  const users = computed(() => slicePage(allUsers.value, page.value, UNAPPROVED_PER_PAGE))
  const total = computed(() => allUsers.value.length)
  const totalPages = computed(() => totalPagesOf(total.value, UNAPPROVED_PER_PAGE))

  const fetchUsers = async () => {
    loading.value = true
    error.value = ''

    try {
      const res = await get<UnapprovedUser[]>(ApiEndpoint.AdminUnapproved, { limit: 50 })
      if (res.error.value) {
        error.value = res.error.value
      } else {
        allUsers.value = res.data.value || []
        page.value = clampPage(page.value, totalPages.value)
      }
    } finally {
      loading.value = false
    }
  }

  const goToPage = (target: number) => {
    page.value = clampPage(target, totalPages.value)
  }

  const approveUser = async (username: string) => {
    approving.value = username
    error.value = ''

    try {
      const res = await patch(ApiEndpoint.AdminApprove, { username, approved: true })
      if (res.error.value) {
        error.value = res.error.value
      } else {
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
