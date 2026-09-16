import { ApiEndpoint } from '~/api/endpoints'

interface SetOwnerState {
  username: Ref<string>
  granting: Ref<boolean>
  error: Ref<string>
  granted: Ref<boolean>
  valid: ComputedRef<boolean>
  setOwner: () => Promise<void>
}

export const useSetOwner = (): SetOwnerState => {
  const { patch } = useApi()

  const username = ref('')
  const granting = ref(false)
  const error = ref('')
  const granted = ref(false)

  const valid = computed(() => username.value.trim() !== '')

  const setOwner = async (): Promise<void> => {
    if (!valid.value || granting.value) return

    granting.value = true
    error.value = ''
    granted.value = false

    try {
      const { error: err } = await patch(ApiEndpoint.AdminSetOwner, {
        username: username.value.trim(),
      })

      if (err.value) {
        error.value = err.value
      } else {
        granted.value = true
        username.value = ''
      }
    } finally {
      granting.value = false
    }
  }

  return { username, granting, error, granted, valid, setOwner }
}
