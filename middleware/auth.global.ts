export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('auth_token', { maxAge: 60 * 60 * 24 * 30 })

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
