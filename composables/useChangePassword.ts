import {
  writeCookie, ACCESS_COOKIE, REFRESH_COOKIE, ROLE_COOKIE, USER_NAME_COOKIE,
} from '~/utils/authCookies'
import { ApiEndpoint } from '~/api/endpoints'
import type { AuthResponse } from '~/api/types'

export const useChangePassword = () => {
  const { patch } = useApi()

  const oldPassword = ref('')
  const newPassword = ref('')
  const saving = ref(false)
  const error = ref('')
  const changed = ref(false)

  const valid = computed(() =>
    oldPassword.value.length >= 6 && newPassword.value.length >= 6)

  const submit = async () => {
    if (!valid.value || saving.value) return

    saving.value = true
    error.value = ''
    changed.value = false

    try {
      const { data, error: err } = await patch<AuthResponse>(ApiEndpoint.AuthChangePassword, {
        old_password: oldPassword.value,
        new_password: newPassword.value,
      })

      if (err.value) {
        error.value = err.value
      } else {
        changed.value = true
        oldPassword.value = ''
        newPassword.value = ''
        if (data.value) {
          writeCookie(ACCESS_COOKIE, data.value.tokens.access_token)
          writeCookie(REFRESH_COOKIE, data.value.tokens.refresh_token)
          writeCookie(ROLE_COOKIE, data.value.role)
          writeCookie(USER_NAME_COOKIE, data.value.username)
        }
      }
    } finally {
      saving.value = false
    }
  }

  return { oldPassword, newPassword, saving, error, changed, valid, submit }
}
