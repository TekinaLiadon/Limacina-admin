interface UnapprovedUser {
  username: string
  createdAt: string
}

export const useUnapprovedUsers = () => {
  const { get, patch } = useApi()

  const users = ref<UnapprovedUser[]>([])
  const error = ref('')
  const loading = ref(true)
  const approving = ref('')

  const fetchUsers = async () => {
    loading.value = true
    error.value = ''

    try {
      const res = await get<UnapprovedUser[]>('/admin/unapproved?limit=50')
      if (res.error.value) {
        error.value = res.error.value
      } else {
        users.value = res.data.value || []
      }
    } finally {
      loading.value = false
    }
  }

  const approveUser = async (username: string) => {
    approving.value = username
    try {
      const res = await patch('/admin/approve', { username, approved: true })
      if (!res.error.value) {
        await fetchUsers()
      }
    } finally {
      approving.value = ''
    }
  }

  const formatDate = (date: string) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return { users, error, loading, approving, fetchUsers, approveUser, formatDate }
}
