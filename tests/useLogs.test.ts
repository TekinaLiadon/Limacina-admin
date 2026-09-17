import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, computed, watch } from 'vue'
import { useApi } from '~/composables/useApi'
import { useLogs } from '~/composables/useLogs'
import type { LogPage } from '~/api/types'

const API = 'http://api.test'

interface FetchCallOptions {
  method?: string
  headers: Record<string, string>
  body?: unknown
}

const fetchMock = vi.fn<(url: string, opts: FetchCallOptions) => Promise<unknown>>()
const navigateMock = vi.fn<(to: string) => unknown>()

const routeMock = { query: {} as Record<string, string> }
const routerMock = { replace: vi.fn<() => void>() }

vi.stubGlobal('$fetch', fetchMock)
vi.stubGlobal('navigateTo', navigateMock)
vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBase: API } }))
vi.stubGlobal('useApi', useApi)
vi.stubGlobal('ref', ref)
vi.stubGlobal('computed', computed)
vi.stubGlobal('watch', watch)
vi.stubGlobal('onScopeDispose', (fn: () => void) => fn)
vi.stubGlobal('useRoute', () => routeMock)
vi.stubGlobal('useRouter', () => routerMock)

const logPage = (lines: string[], total: number, offset: number): LogPage => ({
  date: '2026-01-01',
  lines,
  total,
  limit: 100,
  offset,
})

const LINE = '{"level":30,"time":0,"msg":"hello"}'
const LINE_WARN = '{"level":40,"time":0,"msg":"careful"}'

const offsetOf = (url: string): number => Number(new URL(url).searchParams.get('offset'))

const STALE_OFFSET = 100
const staleResponse = Promise.withResolvers<LogPage>()

const routeStaleFirst = (url: string): Promise<unknown> =>
  offsetOf(url) === STALE_OFFSET ? staleResponse.promise : Promise.resolve(logPage([LINE], 2, 0))

const fail = (statusCode: number, data?: Record<string, unknown>): Promise<never> =>
  Promise.reject(Object.assign(new Error(`Request failed with ${statusCode}`), { statusCode, data }))

describe('useLogs', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    navigateMock.mockReset()
    routerMock.replace.mockReset()
    routeMock.query = {}
  })

  it('loads logs for the selected date', async () => {
    fetchMock.mockResolvedValue(logPage([LINE, LINE_WARN], 2, 0))

    const state = useLogs()
    state.selectedDate.value = '2026-01-01'
    await state.fetchLogs()

    expect(state.parsedLines.value).toHaveLength(2)
    expect(state.total.value).toBe(2)
    expect(state.currentPage.value).toBe(1)
    expect(state.error.value).toBe('')
    expect(state.loading.value).toBeFalsy()
  })

  it('discards a superseded response and keeps its loading flag untouched', async () => {
    fetchMock.mockImplementation(routeStaleFirst)

    const state = useLogs()
    state.selectedDate.value = '2026-01-01'

    state.offset.value = STALE_OFFSET
    const staleFetch = state.fetchLogs()
    state.offset.value = 0
    await state.fetchLogs()

    expect(state.parsedLines.value).toHaveLength(1)
    expect(state.parsedLines.value[0]?.msg).toBe('hello')

    staleResponse.resolve(logPage([LINE_WARN, LINE_WARN], 150, STALE_OFFSET))
    await staleFetch

    expect(state.parsedLines.value).toHaveLength(1)
    expect(state.parsedLines.value[0]?.msg).toBe('hello')
    expect(state.total.value).toBe(2)
    expect(state.loading.value).toBeFalsy()
  })

  it('reloads the last page when the URL page falls out of range', async () => {
    routeMock.query = { page: '5' }

    fetchMock
      .mockResolvedValueOnce(logPage([], 150, 400))
      .mockResolvedValueOnce(logPage([LINE], 150, 100))

    const state = useLogs()
    state.selectedDate.value = '2026-01-01'
    await state.fetchLogs()

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(state.offset.value).toBe(100)
    expect(state.currentPage.value).toBe(2)
    expect(state.parsedLines.value).toHaveLength(1)
  })

  it('surfaces a failed request', async () => {
    fetchMock.mockReturnValue(fail(500, { message: 'Внутренняя ошибка' }))

    const state = useLogs()
    state.selectedDate.value = '2026-01-01'
    await state.fetchLogs()

    expect(state.error.value).toBe('Внутренняя ошибка')
    expect(state.loading.value).toBeFalsy()
  })
})
