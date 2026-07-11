export interface UserListItem {
  uuid: string
  username: string
  role: string
  banned: boolean
  approved: boolean
}

export const useUsers = () => {
  const { get, patch, del } = useApi()

  const users = ref<UserListItem[]>([])
  const loading = ref(true)
  const error = ref('')
  const acting = ref('')

  const fetchUsers = async () => {
    loading.value = true
    error.value = ''

    try {
      const { data, error: err } = await get<UserListItem[]>('/admin/users?limit=100')

      if (err.value) {
        error.value = err.value
      } else if (data.value) {
        users.value = data.value
      }
    } finally {
      loading.value = false
    }
  }

  const changeRole = async (user: UserListItem, newRole: string) => {
    if (newRole === user.role) return
    acting.value = user.username

    try {
      const { error: err } = await patch('/admin/role', {
        username: user.username,
        role: newRole,
      })

      if (err.value) {
        error.value = err.value
      } else {
        user.role = newRole
      }
    } finally {
      acting.value = ''
    }
  }

  const changeApproved = async (user: UserListItem, approved: boolean) => {
    if (approved === user.approved) return
    acting.value = user.username

    try {
      const { error: err } = await patch('/admin/approve', {
        username: user.username,
        approved,
      })

      if (err.value) {
        error.value = err.value
      } else {
        user.approved = approved
      }
    } finally {
      acting.value = ''
    }
  }

  const changeBanned = async (user: UserListItem, banned: boolean) => {
    if (banned === user.banned) return
    acting.value = user.username

    try {
      const { error: err } = await patch('/admin/ban', {
        username: user.username,
        banned,
      })

      if (err.value) {
        error.value = err.value
      } else {
        user.banned = banned
      }
    } finally {
      acting.value = ''
    }
  }

  const deleteUser = async (username: string) => {
    acting.value = username

    try {
      const { error: err } = await del(`/admin/users/${username}`)

      if (err.value) {
        error.value = err.value
      } else {
        users.value = users.value.filter((u) => u.username !== username)
      }
    } finally {
      acting.value = ''
    }
  }

  return {
    users, loading, error, acting,
    fetchUsers, changeRole, changeApproved, changeBanned, deleteUser,
  }
}
