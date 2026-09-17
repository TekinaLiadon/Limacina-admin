import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, computed } from 'vue'
import { useApi } from '~/composables/useApi'
import { useUserAction } from '~/composables/useUserAction'
import { ApiEndpoint } from '~/api/endpoints'

const API = 'http://api.test'

interface FetchCallOptions {
  method?: string
  headers: Record<string, string>
  body?: unknown
}

const fetchMock = vi.fn<(url: string, opts: FetchCallOptions) => Promise<unknown>>()
const navigateMock = vi.fn<(to: string) => unknown>()

vi.stubGlobal('$fetch', fetchMock)
vi.stubGlobal('navigateTo', navigateMock)
vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBase: API } }))
vi.stubGlobal('useApi', useApi)
vi.stubGlobal('ref', ref)
vi.stubGlobal('computed', computed)

const fail = (statusCode: number, data?: Record<string, unknown>): Promise<never> =>
  Promise.reject(Object.assign(new Error(`Request failed with ${statusCode}`), { statusCode, data }))

const ownerAction = (
  isValid: (username: string) => boolean = (username) => username !== '',
): { action: ReturnType<typeof useUserAction>, reset: ReturnType<typeof vi.fn<() => void>> } => {
  const reset = vi.fn<() => void>()
  const action = useUserAction({
    endpoint: ApiEndpoint.AdminSetOwner,
    buildBody: (username) => ({ username }),
    isValid,
    reset,
  })
  return { action, reset }
}

describe('useUserAction', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    navigateMock.mockReset()
  })

  it('patches the endpoint with a trimmed username and resets the field on success', async () => {
    fetchMock.mockResolvedValue({ success: true })
    const { action, reset } = ownerAction()

    action.username.value = '  john  '
    await action.submit()

    expect(fetchMock.mock.calls[0][0]).toBe(`${API}${ApiEndpoint.AdminSetOwner}`)
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: 'PATCH', body: { username: 'john' } })
    expect(action.username.value).toBe('')
    expect(action.success.value).toBeTruthy()
    expect(action.error.value).toBe('')
    expect(action.saving.value).toBeFalsy()
    expect(reset).toHaveBeenCalledTimes(1)
  })

  it('blocks a second submit while the first one is in flight', async () => {
    const pending = Promise.withResolvers<unknown>()
    fetchMock.mockReturnValue(pending.promise)
    const { action } = ownerAction()

    action.username.value = 'john'
    const first = action.submit()

    expect(action.saving.value).toBeTruthy()
    await action.submit()

    pending.resolve({ success: true })
    await first

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('sends nothing while the input is invalid', async () => {
    fetchMock.mockResolvedValue({ success: true })
    const { action } = ownerAction((username) => username.length >= 3)

    action.username.value = 'jo'
    await action.submit()

    expect(fetchMock).not.toHaveBeenCalled()
    expect(action.saving.value).toBeFalsy()
    expect(action.success.value).toBeFalsy()
  })

  it('keeps the field and reports the message when the request fails', async () => {
    fetchMock.mockReturnValue(fail(500, { message: 'Внутренняя ошибка' }))
    const { action, reset } = ownerAction()

    action.username.value = 'john'
    await action.submit()

    expect(action.error.value).toBe('Внутренняя ошибка')
    expect(action.success.value).toBeFalsy()
    expect(action.username.value).toBe('john')
    expect(reset).not.toHaveBeenCalled()
  })

  it('clears the previous error when a new submit starts', async () => {
    fetchMock.mockReturnValueOnce(fail(500, { message: 'Внутренняя ошибка' }))
    fetchMock.mockResolvedValueOnce({ success: true })
    const { action } = ownerAction()

    action.username.value = 'john'
    await action.submit()
    expect(action.error.value).toBe('Внутренняя ошибка')

    await action.submit()

    expect(action.error.value).toBe('')
    expect(action.success.value).toBeTruthy()
  })
})
