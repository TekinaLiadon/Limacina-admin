import { ROLE_COOKIE } from '~/utils/authCookies'

export default defineNuxtRouteMiddleware(() => {
  const role = useCookie(ROLE_COOKIE)

  if (role.value !== 'owner') {
    return navigateTo('/users')
  }
})
