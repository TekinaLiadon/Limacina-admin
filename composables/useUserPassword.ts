import { ApiEndpoint } from '~/api/endpoints'

export const useUserPassword = () => {
  const { patch } = useApi()

  const username = ref('')
  const password = ref('')
  const saving = ref(false)
  const error = ref('')
  const changed = ref(false)

  const valid = computed(() =>
    username.value.trim() !== '' && password.value.trim().length >= 6)

  const submit = async () => {
    if (!valid.value || saving.value) return

    saving.value = true
    error.value = ''
    changed.value = false

    try {
      const { error: err } = await patch(ApiEndpoint.AdminUserPassword, {
        username: username.value.trim(),
        password: password.value.trim(),
      })

      if (err.value) {
        error.value = err.value
      } else {
        changed.value = true
        username.value = ''
        password.value = ''
      }
    } finally {
      saving.value = false
    }
  }

  return { username, password, saving, error, changed, valid, submit }
}
