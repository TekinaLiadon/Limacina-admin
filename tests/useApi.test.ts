import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useApi } from '~/composables/useApi'
import { readCookie, writeCookie } from '~/utils/authCookies'

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
vi.stubGlobal('ref', ref)

const ok = <T>(data: T) => Promise.resolve(data)

const fail = (statusCode: number, data?: Record<string, unknown>) =>
  Promise.reject(Object.assign(new Error(`Request failed with ${statusCode}`), { statusCode, data }))

const tokens = (access_token: string, refresh_token: string) => ({
  tokens: { access_token, refresh_token },
})

beforeEach(() => {
  fetchMock.mockReset()
  navigateMock.mockReset()
  writeCookie('auth_token', null)
  writeCookie('refresh_token', null)
})

describe('useApi — successful requests', () => {
  it('returns data on success', async () => {
    fetchMock.mockImplementation(() => ok({ value: 42 }))

    const { data, error, pending } = await useApi().get<{ value: number }>('/v1/panel/users')

    expect(data.value).toEqual({ value: 42 })
    expect(error.value).toBeNull()
    expect(pending.value).toBe(false)
  })

  it('attaches Authorization header from auth_token cookie', async () => {
    writeCookie('auth_token', 'access-1')
    fetchMock.mockImplementation(() => ok({}))

    await useApi().get('/v1/panel/users')

    expect(fetchMock.mock.calls[0][1].headers).toEqual({ Authorization: 'Bearer access-1' })
  })

  it('sends no Authorization header without cookie', async () => {
    fetchMock.mockImplementation(() => ok({}))

    await useApi().get('/v1/panel/users')

    expect(fetchMock.mock.calls[0][1].headers).toEqual({})
  })

  it('serializes query params', async () => {
    fetchMock.mockImplementation(() => ok({}))

    await useApi().get('/v1/panel/logs', { date: '2026-01-01', limit: 100 })

    expect(fetchMock.mock.calls[0][0]).toBe(`${API}/v1/panel/logs?date=2026-01-01&limit=100`)
  })

  it('passes method and body for post, patch and del', async () => {
    fetchMock.mockImplementation(() => ok({ success: true }))
    const { post, patch, del } = useApi()

    await post('/v1/panel/users', { username: 'john' })
    await patch('/v1/panel/users/approve', { username: 'john', approved: true })
    await del('/v1/panel/users/john')

    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: 'POST', body: { username: 'john' } })
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: 'PATCH', body: { username: 'john', approved: true } })
    expect(fetchMock.mock.calls[2][1]).toMatchObject({ method: 'DELETE' })
  })
})

describe('useApi — errors', () => {
  it('sets error from response message', async () => {
    fetchMock.mockImplementation(() => fail(500, { message: 'Внутренняя ошибка' }))

    const { data, error } = await useApi().get('/v1/panel/users')

    expect(data.value).toBeNull()
    expect(error.value).toBe('Внутренняя ошибка')
  })

  it('takes the first message from validation errors array', async () => {
    fetchMock.mockImplementation(() => fail(400, { message: ['limit must be an integer', 'limit must be positive'] }))

    const { error } = await useApi().get('/v1/panel/users')

    expect(error.value).toBe('limit must be an integer')
  })

  it('falls back to error message when no message in response', async () => {
    fetchMock.mockImplementation(() => fail(503))

    const { error, cause } = await useApi().get('/v1/panel/users')

    expect(error.value).toBe('Request failed with 503')
    expect(cause.value).toBeTruthy()
  })

  it('falls back to a generic message', async () => {
    fetchMock.mockImplementation(() => Promise.reject(new Error()))

    const { error } = await useApi().get('/v1/panel/users')

    expect(error.value).toBe('Request failed')
  })
})

describe('useApi — session invalidation', () => {
  it('sends invalidate request with refresh token', async () => {
    writeCookie('refresh_token', 'r-1')
    fetchMock.mockImplementation(() => ok({ success: true }))

    useApi().invalidateSession()
    await Promise.resolve()

    expect(fetchMock).toHaveBeenCalledWith(`${API}/v1/common/auth/invalidate`, {
      method: 'POST',
      body: { refresh_token: 'r-1' },
    })
  })

  it('does nothing without refresh token cookie', async () => {
    fetchMock.mockImplementation(() => ok({ success: true }))

    useApi().invalidateSession()
    await Promise.resolve()

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('swallows invalidate errors', async () => {
    writeCookie('refresh_token', 'r-1')
    fetchMock.mockImplementation(() => fail(400))

    useApi().invalidateSession()
    await new Promise((resolve) => setTimeout(resolve, 0))
  })

  it('invalidates session when refresh fails', async () => {
    writeCookie('auth_token', 'old-access')
    writeCookie('refresh_token', 'dead-refresh')

    fetchMock.mockImplementation((url: string) =>
      url === `${API}/v1/common/auth/invalidate` ? ok({ success: true }) : fail(401),
    )

    await useApi().get('/v1/panel/users')

    expect(fetchMock).toHaveBeenCalledWith(`${API}/v1/common/auth/invalidate`, {
      method: 'POST',
      body: { refresh_token: 'dead-refresh' },
    })
  })

  it('invalidates new session when retried request fails with 401 again', async () => {
    writeCookie('auth_token', 'old-access')
    writeCookie('refresh_token', 'old-refresh')

    fetchMock.mockImplementation((url: string) => {
      if (url === `${API}/v1/common/auth/refresh`) return ok(tokens('new-access', 'new-refresh'))
      if (url === `${API}/v1/common/auth/invalidate`) return ok({ success: true })
      return fail(401)
    })

    await useApi().get('/v1/panel/users')

    expect(fetchMock).toHaveBeenCalledWith(`${API}/v1/common/auth/invalidate`, {
      method: 'POST',
      body: { refresh_token: 'new-refresh' },
    })
  })
})

describe('useApi — token refresh on 401', () => {
  it('refreshes tokens and retries the request', async () => {
    writeCookie('auth_token', 'old-access')
    writeCookie('refresh_token', 'old-refresh')

    let usersCalls = 0
    fetchMock.mockImplementation((url: string) => {
      if (url === `${API}/v1/common/auth/refresh`) return ok(tokens('new-access', 'new-refresh'))
      usersCalls++
      return usersCalls === 1 ? fail(401) : ok([{ uuid: 'u1' }])
    })

    const { data, error } = await useApi().get('/v1/panel/users')

    expect(data.value).toEqual([{ uuid: 'u1' }])
    expect(error.value).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(3)

    expect(fetchMock).toHaveBeenCalledWith(`${API}/v1/common/auth/refresh`, {
      method: 'POST',
      body: { refresh_token: 'old-refresh' },
    })

    expect(fetchMock.mock.calls[2][1].headers.Authorization).toBe('Bearer new-access')
    expect(readCookie('auth_token')).toBe('new-access')
    expect(readCookie('refresh_token')).toBe('new-refresh')
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it('logs out when refresh fails', async () => {
    writeCookie('auth_token', 'old-access')
    writeCookie('refresh_token', 'dead-refresh')

    fetchMock.mockImplementation((url: string) =>
      url === `${API}/v1/common/auth/refresh` ? fail(401) : fail(401),
    )

    const { data, error } = await useApi().get('/v1/panel/users')

    expect(data.value).toBeNull()
    expect(error.value).toBe('Unauthorized')
    expect(readCookie('auth_token')).toBeNull()
    expect(readCookie('refresh_token')).toBeNull()
    expect(navigateMock).toHaveBeenCalledWith('/login')
  })

  it('does not attempt refresh without refresh_token cookie', async () => {
    writeCookie('auth_token', 'old-access')
    fetchMock.mockImplementation(() => fail(401))

    const { error } = await useApi().get('/v1/panel/users')

    expect(error.value).toBe('Unauthorized')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(navigateMock).toHaveBeenCalledWith('/login')
  })

  it('logs out when the retried request fails with 401 again', async () => {
    writeCookie('auth_token', 'old-access')
    writeCookie('refresh_token', 'old-refresh')

    fetchMock.mockImplementation((url: string) =>
      url === `${API}/v1/common/auth/refresh` ? ok(tokens('new-access', 'new-refresh')) : fail(401),
    )

    const { data, error } = await useApi().get('/v1/panel/users')

    expect(data.value).toBeNull()
    expect(error.value).toBe('Unauthorized')
    expect(readCookie('auth_token')).toBeNull()
    expect(navigateMock).toHaveBeenCalledWith('/login')
  })

  it('shares a single refresh request between parallel 401s', async () => {
    writeCookie('auth_token', 'old-access')
    writeCookie('refresh_token', 'old-refresh')

    fetchMock.mockImplementation((url: string) => {
      if (url === `${API}/v1/common/auth/refresh`) return ok(tokens('new-access', 'new-refresh'))
      if (url === `${API}/page/a` || url === `${API}/page/b`) {
        const failed = fetchMock.mock.calls.filter((c) => c[0] === url).length === 1
        return failed ? fail(401) : ok({ ok: true })
      }
      return ok({})
    })

    const { get } = useApi()
    const [resA, resB] = await Promise.all([get('/page/a'), get('/page/b')])

    expect(resA.data.value).toEqual({ ok: true })
    expect(resB.data.value).toEqual({ ok: true })

    const refreshCalls = fetchMock.mock.calls.filter((c) => c[0] === `${API}/v1/common/auth/refresh`)
    expect(refreshCalls).toHaveLength(1)
  })
})
