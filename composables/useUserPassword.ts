import { ApiEndpoint } from '~/api/endpoints'

interface UserPasswordState {
  username: Ref<string>
  password: Ref<string>
  saving: Ref<boolean>
  error: Ref<string>
  changed: Ref<boolean>
  valid: ComputedRef<boolean>
  submit: () => Promise<void>
}

export const useUserPassword = (): UserPasswordState => {
  const { patch } = useApi()

  const username = ref('')
  const password = ref('')
  const saving = ref(false)
  const error = ref('')
  const changed = ref(false)

  const valid = computed(() =>
    username.value.trim() !== '' && password.value.length >= 6)

  const submit = async (): Promise<void> => {
    if (!valid.value || saving.value) return

    saving.value = true
    error.value = ''
    changed.value = false

    try {
      const { error: err } = await patch(ApiEndpoint.AdminUserPassword, {
        username: username.value.trim(),
        password: password.value,
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
