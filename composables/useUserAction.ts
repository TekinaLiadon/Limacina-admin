import type { ApiEndpoint } from '~/api/endpoints'

interface UserActionOptions {
  endpoint: ApiEndpoint
  buildBody: (username: string) => Record<string, unknown>
  isValid: (username: string) => boolean
  reset?: () => void
}

interface UserActionState {
  username: Ref<string>
  saving: Ref<boolean>
  error: Ref<string>
  success: Ref<boolean>
  valid: ComputedRef<boolean>
  submit: () => Promise<void>
}

export const useUserAction = (options: UserActionOptions): UserActionState => {
  const { patch } = useApi()

  const username = ref('')
  const saving = ref(false)
  const error = ref('')
  const success = ref(false)

  const valid = computed(() => options.isValid(username.value.trim()))

  const submit = async (): Promise<void> => {
    if (!valid.value || saving.value) return

    saving.value = true
    error.value = ''
    success.value = false

    try {
      const { error: requestError } = await patch(options.endpoint, options.buildBody(username.value.trim()))

      if (requestError.value) {
        error.value = requestError.value
      } else {
        success.value = true
        username.value = ''
        options.reset?.()
      }
    } finally {
      saving.value = false
    }
  }

  return { username, saving, error, success, valid, submit }
}
