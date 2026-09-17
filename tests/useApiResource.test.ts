import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useApi } from '~/composables/useApi'
import { useApiResource } from '~/composables/useApiResource'
import { ApiEndpoint } from '~/api/endpoints'

const API = 'http://api.test'

interface FetchCallOptions {
  method?: string
  headers: Record<string, string>
  body?: unknown
}

interface ResourceResult {
  data: Ref<unknown | null>
  is404: boolean
}

const fetchMock = vi.fn<(url: string, opts: FetchCallOptions) => Promise<unknown>>()
const navigateMock = vi.fn<(to: string) => unknown>()

vi.stubGlobal('$fetch', fetchMock)
vi.stubGlobal('navigateTo', navigateMock)
vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBase: API } }))
vi.stubGlobal('useApi', useApi)
vi.stubGlobal('ref', ref)

const fail = (statusCode: number, data?: Record<string, unknown>): Promise<never> =>
  Promise.reject(Object.assign(new Error(`Request failed with ${statusCode}`), { statusCode, data }))

const ENDPOINT = ApiEndpoint.LauncherReleases
const FORMAT_ERROR = 'API вернула некорректные данные'

const makeResource = (options: {
  tolerate404?: boolean
}): {
  loading: Ref<boolean>
  error: Ref<string>
  handle: ReturnType<typeof vi.fn<(result: ResourceResult) => void>>
  fetchResource: (silent?: boolean) => Promise<void>
} => {
  const loading = ref(false)
  const error = ref('')
  const handle = vi.fn<(result: ResourceResult) => void>()
  const fetchResource = useApiResource<unknown>({
    endpoint: ENDPOINT,
    loading,
    error,
    tolerate404: options.tolerate404,
    handle,
  })
  return { loading, error, handle, fetchResource }
}

describe('useApiResource', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    navigateMock.mockReset()
  })

  it('raises loading for a regular fetch and passes data to the handler', async () => {
    const pending = Promise.withResolvers<unknown>()
    fetchMock.mockReturnValue(pending.promise)
    const { loading, handle, fetchResource } = makeResource({})

    const promise = fetchResource()
    expect(loading.value).toBeTruthy()

    pending.resolve({ releases: [] })
    await promise

    expect(loading.value).toBeFalsy()
    expect(handle).toHaveBeenCalledTimes(1)
    expect(handle.mock.calls[0][0].data.value).toStrictEqual({ releases: [] })
    expect(handle.mock.calls[0][0].is404).toBeFalsy()
  })

  it('does not touch loading in silent mode', async () => {
    fetchMock.mockResolvedValue({ releases: [] })
    const { loading, fetchResource } = makeResource({})

    loading.value = true
    await fetchResource(true)
    expect(loading.value).toBeTruthy()

    loading.value = false
    await fetchResource(true)
    expect(loading.value).toBeFalsy()
  })

  it('reports the message and skips the handler when the request fails', async () => {
    fetchMock.mockReturnValue(fail(500, { message: 'Внутренняя ошибка' }))
    const { error, handle, fetchResource } = makeResource({})

    await fetchResource()

    expect(error.value).toBe('Внутренняя ошибка')
    expect(handle).not.toHaveBeenCalled()
  })

  it('treats a tolerated 404 as an empty resource', async () => {
    fetchMock.mockReturnValue(fail(404, { message: 'Not found' }))
    const { error, handle, fetchResource } = makeResource({ tolerate404: true })

    await fetchResource()

    expect(error.value).toBe('')
    expect(handle).toHaveBeenCalledTimes(1)
    expect(handle.mock.calls[0][0].data.value).toBeNull()
    expect(handle.mock.calls[0][0].is404).toBeTruthy()
  })

  it('reports a 404 as an error when it is not tolerated', async () => {
    fetchMock.mockReturnValue(fail(404, { message: 'Not found' }))
    const { error, handle, fetchResource } = makeResource({})

    await fetchResource()

    expect(error.value).toBe('Not found')
    expect(handle).not.toHaveBeenCalled()
  })

  it('lets the handler report a format error', async () => {
    fetchMock.mockResolvedValue({ unexpected: 'shape' })
    const loading = ref(false)
    const error = ref('')
    const fetchResource = useApiResource<unknown>({
      endpoint: ENDPOINT,
      loading,
      error,
      handle: () => {
        error.value = FORMAT_ERROR
      },
    })

    await fetchResource()

    expect(error.value).toBe(FORMAT_ERROR)
  })
})
