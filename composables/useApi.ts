interface ApiResponse<T> {
  data: Ref<T | null>
  error: Ref<string | null>
  pending: Ref<boolean>
}

export const useApi = () => {
  const config = useRuntimeConfig()
  const token = useCookie('auth_token', { maxAge: 60 * 60 * 24 * 30 })
  const baseURL = config.public.apiBase

  const request = async <T>(
    path: string,
    options: {
      method?: string
      body?: any
    } = {}
  ): Promise<ApiResponse<T>> => {
    const data = ref<T | null>(null) as Ref<T | null>
    const error = ref<string | null>(null)
    const pending = ref(true)

    try {
      const headers: Record<string, string> = {}
      if (token.value) {
        headers['Authorization'] = `Bearer ${token.value}`
      }

      const response = await $fetch<T>(`${baseURL}${path}`, {
        method: (options.method || 'GET') as any,
        headers,
        body: options.body,
      })

      data.value = response
    } catch (e: any) {
      if (e?.statusCode === 401) {
        token.value = null
        navigateTo('/login')
        return { data, error: ref('Unauthorized'), pending }
      }
      error.value = e?.data?.errorMessage || e?.message || 'Request failed'
    } finally {
      pending.value = false
    }

    return { data, error, pending }
  }

  return {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: any) => request<T>(path, { method: 'POST', body }),
    patch: <T>(path: string, body?: any) => request<T>(path, { method: 'PATCH', body }),
    del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  }
}
