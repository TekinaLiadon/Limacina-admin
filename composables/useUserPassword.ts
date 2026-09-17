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
  const password = ref('')

  const { username, saving, error, success: changed, valid, submit } = useUserAction({
    endpoint: ApiEndpoint.AdminUserPassword,
    buildBody: (name) => ({ username: name, password: password.value }),
    isValid: (name) => name !== '' && password.value.length >= 6,
    reset: () => { password.value = '' },
  })

  return { username, password, saving, error, changed, valid, submit }
}
