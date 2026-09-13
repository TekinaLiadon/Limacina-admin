import { ACCESS_COOKIE } from '~/utils/authCookies'

export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie(ACCESS_COOKIE)

  const publicPaths = ['/login', '/registration']

  if (!publicPaths.includes(to.path) && !token.value) {
    return navigateTo('/login')
  }

  if (to.path === '/login' && token.value) {
    return navigateTo('/unapproved')
  }

  if (to.path === '/registration' && token.value) {
    return navigateTo('/unapproved')
  }
})
