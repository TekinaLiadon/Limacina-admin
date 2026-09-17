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
  const { username, saving: granting, error, success: granted, valid, submit: setOwner } = useUserAction({
    endpoint: ApiEndpoint.AdminSetOwner,
    buildBody: (name) => ({ username: name }),
    isValid: (name) => name !== '',
  })

  return { username, granting, error, granted, valid, setOwner }
}
