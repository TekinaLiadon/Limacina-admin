import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, computed, watch, nextTick } from 'vue'
import { useApi } from '~/composables/useApi'
import { useLogs } from '~/composables/useLogs'
import { ApiEndpoint } from '~/api/endpoints'
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

const lastUrl = (): string => fetchMock.mock.calls.at(-1)?.[0] ?? ''

const datesHandler = (dates: string[], logs: LogPage): ((url: string) => Promise<unknown>) => {
  const datesUrl = `${API}${ApiEndpoint.AdminLogDates}`
  return (url: string) => (url === datesUrl ? Promise.resolve(dates) : Promise.resolve(logs))
}

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

  it('skips fetching without a selected date', async () => {
    fetchMock.mockResolvedValue(logPage([LINE], 1, 0))

    const state = useLogs()
    await state.fetchLogs()

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('seeds filters from the URL query', () => {
    routeMock.query = { level: '40', limit: '250', status: '500', url: '/v1/x', ip: '1.2.3.4' }

    const state = useLogs()

    expect(state.levelFilter.value).toBe('40')
    expect(state.limit.value).toBe(250)
    expect(state.statusCode.value).toBe('500')
    expect(state.urlFilter.value).toBe('/v1/x')
    expect(state.ipFilter.value).toBe('1.2.3.4')
  })

  it('ignores URL values that do not match the allowed sets', () => {
    routeMock.query = { level: '99', limit: '77', status: '20' }

    const state = useLogs()

    expect(state.levelFilter.value).toBe('')
    expect(state.limit.value).toBe(100)
    expect(state.statusCode.value).toBe('')
  })

  it('expands and collapses a log row', () => {
    const state = useLogs()

    state.toggleRow(2)
    expect(state.expandedRow.value).toBe(2)

    state.toggleRow(2)
    expect(state.expandedRow.value).toBeNull()
  })

  it('filters parsed lines by level on the client', async () => {
    fetchMock.mockResolvedValue(logPage([LINE, LINE_WARN], 2, 0))

    const state = useLogs()
    state.selectedDate.value = '2026-01-01'
    await state.fetchLogs()
    expect(state.parsedLines.value).toHaveLength(2)

    state.levelFilter.value = '40'
    await nextTick()

    expect(state.parsedLines.value).toHaveLength(1)
    expect(state.parsedLines.value[0]?.msg).toBe('careful')
  })

  it('walks pages by offset', async () => {
    fetchMock.mockImplementation((url: string) =>
      Promise.resolve(logPage([LINE], 250, offsetOf(url))),
    )

    const state = useLogs()
    state.selectedDate.value = '2026-01-01'
    await state.fetchLogs()

    state.nextPage()
    await vi.waitFor(() => expect(offsetOf(lastUrl())).toBe(100))

    state.prevPage()
    await vi.waitFor(() => expect(offsetOf(lastUrl())).toBe(0))

    state.goToPage(3)
    await vi.waitFor(() => expect(offsetOf(lastUrl())).toBe(200))
  })

  it('resets the offset when the date or the page size changes', async () => {
    fetchMock.mockResolvedValue(logPage([LINE], 250, 0))

    const state = useLogs()
    state.selectedDate.value = '2026-01-01'
    await state.fetchLogs()

    state.offset.value = 100
    state.onDateChange()
    await vi.waitFor(() => expect(offsetOf(lastUrl())).toBe(0))

    state.offset.value = 100
    state.onLimitChange()
    await vi.waitFor(() => expect(offsetOf(lastUrl())).toBe(0))
  })

  it('refetches through the debounce after a server-side filter changes', async () => {
    fetchMock.mockResolvedValue(logPage([LINE], 1, 0))

    const state = useLogs()
    state.selectedDate.value = '2026-01-01'
    await state.fetchLogs()

    state.statusCode.value = '500'
    await vi.waitFor(() => expect(lastUrl()).toContain('statusCode=500'))
  })

  it('writes the current filters into the URL query', async () => {
    fetchMock.mockResolvedValue(logPage([LINE], 1, 0))

    const state = useLogs()
    state.selectedDate.value = '2026-01-01'
    state.levelFilter.value = '40'
    await state.fetchLogs()
    await nextTick()

    expect(routerMock.replace).toHaveBeenCalledWith({ query: { date: '2026-01-01', level: '40' } })
  })

  it('writes every active filter into the URL query', async () => {
    routeMock.query = { limit: '250' }
    fetchMock.mockImplementation((url: string) =>
      Promise.resolve(logPage([LINE], 300, offsetOf(url))),
    )

    const state = useLogs()
    state.selectedDate.value = '2026-01-01'
    state.levelFilter.value = '40'
    state.statusCode.value = '500'
    state.urlFilter.value = '/v1/x'
    state.ipFilter.value = '1.2.3.4'
    state.offset.value = 250
    await state.fetchLogs()
    await nextTick()

    expect(routerMock.replace).toHaveBeenCalledWith({
      query: {
        date: '2026-01-01',
        level: '40',
        status: '500',
        url: '/v1/x',
        ip: '1.2.3.4',
        limit: '250',
        page: '2',
      },
    })
  })

  it('keeps the state empty when the logs response has no body', async () => {
    fetchMock.mockResolvedValue(null)

    const state = useLogs()
    state.selectedDate.value = '2026-01-01'
    await state.fetchLogs()

    expect(state.parsedLines.value).toStrictEqual([])
    expect(state.total.value).toBe(0)
    expect(state.loading.value).toBeFalsy()
  })

  it('omits the date from the query before a date is chosen', async () => {
    fetchMock.mockResolvedValue(logPage([LINE], 1, 0))

    const state = useLogs()
    state.limit.value = 500
    await nextTick()

    expect(routerMock.replace).toHaveBeenCalledWith({ query: { limit: '500' } })
  })

  it('loads available dates and defaults to the first one', async () => {
    fetchMock.mockImplementation(datesHandler(['2026-01-02', '2026-01-01'], logPage([LINE], 1, 0)))

    const state = useLogs()
    await state.fetchDates()

    expect(state.dates.value).toStrictEqual(['2026-01-02', '2026-01-01'])
    expect(state.selectedDate.value).toBe('2026-01-02')
    expect(state.parsedLines.value).toHaveLength(1)
    expect(state.loading.value).toBeFalsy()
  })

  it('keeps the date from the URL when it is available', async () => {
    routeMock.query = { date: '2026-01-01' }
    fetchMock.mockImplementation(datesHandler(['2026-01-02', '2026-01-01'], logPage([LINE], 1, 0)))

    const state = useLogs()
    await state.fetchDates()

    expect(state.selectedDate.value).toBe('2026-01-01')
  })

  it('does not fetch logs when there are no dates', async () => {
    fetchMock.mockImplementation(datesHandler([], logPage([LINE], 1, 0)))

    const state = useLogs()
    await state.fetchDates()

    expect(state.dates.value).toStrictEqual([])
    expect(state.selectedDate.value).toBe('')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('surfaces a failed dates request', async () => {
    fetchMock.mockReturnValue(fail(500, { message: 'Журнал дат недоступен' }))

    const state = useLogs()
    await state.fetchDates()

    expect(state.error.value).toBe('Журнал дат недоступен')
    expect(state.loading.value).toBeFalsy()
  })
})
