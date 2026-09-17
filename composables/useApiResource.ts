import type { ApiEndpoint } from '~/api/endpoints'
import { toFetchError } from '~/api/errors'

interface ResourceResult<TData> {
  data: Ref<TData | null>
  is404: boolean
}

interface ApiResourceOptions<TData> {
  endpoint: ApiEndpoint
  loading: Ref<boolean>
  error: Ref<string>
  tolerate404?: boolean
  handle: (result: ResourceResult<TData>) => void
}

export type FetchResource = (silent?: boolean) => Promise<void>

export const useApiResource = <TData>(options: ApiResourceOptions<TData>): FetchResource => {
  const { get } = useApi()

  const fetchResource = async (silent = false): Promise<void> => {
    const tracked = !silent
    if (tracked) options.loading.value = true
    options.error.value = ''

    try {
      const result = await get<TData>(options.endpoint)
      const notFound = toFetchError(result.cause.value).statusCode === 404
      const suppressed = options.tolerate404 === true && notFound

      if (result.error.value !== null && !suppressed) {
        options.error.value = result.error.value
        return
      }

      options.handle({ data: result.data, is404: notFound })
    } finally {
      if (tracked) options.loading.value = false
    }
  }

  return fetchResource
}
