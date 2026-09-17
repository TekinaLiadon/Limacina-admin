import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, computed, watch } from 'vue'
import { useApi } from '~/composables/useApi'
import { useUsersList } from '~/composables/useUsersList'
import { ApiEndpoint } from '~/api/endpoints'
import { API_FORMAT_ERROR, type Page, type UserListItem } from '~/api/types'

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
vi.stubGlobal('watch', watch)
vi.stubGlobal('onScopeDispose', (fn: () => void) => fn)

const PER_PAGE = 20

const user = (username: string): UserListItem => ({
  uuid: `uuid-${username}`,
  username,
  role: 'user',
  approved: true,
  banned: false,
})

const page = <TItem>(items: TItem[], total: number, offset: number): Page<TItem> => ({
  items,
  total,
  limit: PER_PAGE,
  offset,
})

const offsetOf = (url: string): number => Number(new URL(url).searchParams.get('offset'))

const staleResponse = Promise.withResolvers<Page<UserListItem>>()

const routeStaleFirst = (url: string): Promise<unknown> =>
  offsetOf(url) === PER_PAGE ? staleResponse.promise : Promise.resolve(page([user('fresh')], 5, 0))

const fail = (statusCode: number, data?: Record<string, unknown>): Promise<never> =>
  Promise.reject(Object.assign(new Error(`Request failed with ${statusCode}`), { statusCode, data }))

describe('useUsersList', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    navigateMock.mockReset()
  })

  it('loads the requested page', async () => {
    fetchMock.mockResolvedValue(page([user('john'), user('jane')], 25, 20))

    const state = useUsersList<UserListItem>({ endpoint: ApiEndpoint.AdminUsers, perPage: PER_PAGE })
    state.page.value = 2
    await state.fetchUsers()

    expect(state.users.value.map((item) => item.username)).toStrictEqual(['john', 'jane'])
    expect(state.total.value).toBe(25)
    expect(state.totalPages.value).toBe(2)
    expect(state.error.value).toBe('')
    expect(state.loading.value).toBeFalsy()
  })

  it('discards a superseded response and keeps its loading flag untouched', async () => {
    fetchMock.mockImplementation(routeStaleFirst)

    const state = useUsersList<UserListItem>({ endpoint: ApiEndpoint.AdminUsers, perPage: PER_PAGE })

    state.page.value = 2
    const staleFetch = state.fetchUsers()
    state.page.value = 1
    await state.fetchUsers()

    expect(state.users.value.map((item) => item.username)).toStrictEqual(['fresh'])

    staleResponse.resolve(page([user('stale')], 25, PER_PAGE))
    await staleFetch

    expect(state.users.value.map((item) => item.username)).toStrictEqual(['fresh'])
    expect(state.total.value).toBe(5)
    expect(state.loading.value).toBeFalsy()
  })

  it('reloads the last valid page when the current one falls out of range', async () => {
    fetchMock
      .mockResolvedValueOnce(page<UserListItem>([], 40, 40))
      .mockResolvedValueOnce(page([user('p2-a'), user('p2-b')], 40, 20))

    const state = useUsersList<UserListItem>({ endpoint: ApiEndpoint.AdminUsers, perPage: PER_PAGE })
    state.page.value = 3
    await state.fetchUsers()

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(state.page.value).toBe(2)
    expect(state.users.value.map((item) => item.username)).toStrictEqual(['p2-a', 'p2-b'])
  })

  it('refetches when goToPage targets the current page', async () => {
    fetchMock.mockResolvedValue(page([user('john')], 1, 0))

    const state = useUsersList<UserListItem>({ endpoint: ApiEndpoint.AdminUsers, perPage: PER_PAGE })
    state.goToPage(1)

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    expect(state.page.value).toBe(1)
    await vi.waitFor(() =>
      expect(state.users.value.map((item) => item.username)).toStrictEqual(['john']),
    )
  })

  it('steps back to the previous page after removing the last item', async () => {
    fetchMock
      .mockResolvedValueOnce(page([user('last')], 21, 20))
      .mockResolvedValueOnce(page([user('p1')], 20, 0))

    const state = useUsersList<UserListItem>({ endpoint: ApiEndpoint.AdminUsers, perPage: PER_PAGE })
    state.page.value = 2
    await state.fetchUsers()
    await state.refetchAfterRemoval()

    expect(state.page.value).toBe(1)
    expect(state.users.value.map((item) => item.username)).toStrictEqual(['p1'])
  })

  it('sets a format error on a malformed page', async () => {
    fetchMock.mockResolvedValue({ items: 'not-an-array', total: 5 })

    const state = useUsersList<UserListItem>({ endpoint: ApiEndpoint.AdminUsers, perPage: PER_PAGE })
    await state.fetchUsers()

    expect(state.error.value).toBe(API_FORMAT_ERROR)
    expect(state.loading.value).toBeFalsy()
  })

  it('surfaces a failed request', async () => {
    fetchMock.mockReturnValue(fail(500, { message: 'Внутренняя ошибка' }))

    const state = useUsersList<UserListItem>({ endpoint: ApiEndpoint.AdminUsers, perPage: PER_PAGE })
    await state.fetchUsers()

    expect(state.error.value).toBe('Внутренняя ошибка')
    expect(state.loading.value).toBeFalsy()
  })
})
