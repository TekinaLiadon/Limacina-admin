import { type LogEntry, parseLines } from '~/utils/logHelpers'
import { ApiEndpoint } from '~/api/endpoints'
import type { LogPage } from '~/api/types'
import { debounce } from '~/utils/debounce'

const LEVELS = new Set(['10', '20', '30', '40', '50', '60'])
const LIMITS = new Set([100, 250, 500, 1000])
const DEFAULT_LIMIT = 100
const FILTER_DEBOUNCE_MS = 400

const queryString = (value: unknown): string => (typeof value === 'string' ? value : '')

interface LogsState {
  dates: Ref<string[]>
  selectedDate: Ref<string>
  parsedLines: Ref<LogEntry[]>
  offset: Ref<number>
  limit: Ref<number>
  total: Ref<number>
  currentPage: ComputedRef<number>
  totalPages: ComputedRef<number>
  loading: Ref<boolean>
  error: Ref<string>
  levelFilter: Ref<string>
  urlFilter: Ref<string>
  ipFilter: Ref<string>
  statusCode: Ref<string>
  expandedRow: Ref<number | null>
  toggleRow: (index: number) => void
  fetchDates: () => Promise<void>
  fetchLogs: () => Promise<void>
  onDateChange: () => void
  onLimitChange: () => void
  prevPage: () => void
  nextPage: () => void
  goToPage: (page: number) => void
}

export const useLogs = (): LogsState => {
  const { get } = useApi()
  const route = useRoute()
  const router = useRouter()

  const dates = ref<string[]>([])
  const selectedDate = ref('')
  const parsedLines = ref<LogEntry[]>([])
  const rawLines = ref<string[]>([])
  const offset = ref(0)
  const limit = ref(DEFAULT_LIMIT)
  const total = ref(0)
  const loading = ref(true)
  const error = ref('')
  const levelFilter = ref('')
  const urlFilter = ref('')
  const ipFilter = ref('')
  const statusCode = ref('')
  const expandedRow = ref<number | null>(null)

  const queryLevel = queryString(route.query.level)
  if (LEVELS.has(queryLevel)) levelFilter.value = queryLevel

  const queryLimit = Number(queryString(route.query.limit))
  if (LIMITS.has(queryLimit)) limit.value = queryLimit

  const queryStatus = queryString(route.query.status)
  if (/^\d{3}$/u.test(queryStatus)) statusCode.value = queryStatus

  const queryUrl = queryString(route.query.url)
  if (queryUrl) urlFilter.value = queryUrl

  const queryIp = queryString(route.query.ip)
  if (queryIp) ipFilter.value = queryIp

  const queryDate = queryString(route.query.date)
  const queryPage = Number(queryString(route.query.page))
  if (Number.isInteger(queryPage) && queryPage > 1) {
    offset.value = (queryPage - 1) * limit.value
  }

  const toggleRow = (index: number): void => {
    expandedRow.value = expandedRow.value === index ? null : index
  }

  const applyLevelFilter = (): void => {
    let entries = parseLines(rawLines.value)
    if (levelFilter.value) {
      entries = entries.filter((entry) => entry.level === Number(levelFilter.value))
    }
    parsedLines.value = entries
    expandedRow.value = null
  }

  let requestCounter = 0

  const currentPage = computed(() => Math.floor(offset.value / limit.value) + 1)
  const totalPages = computed(() => Math.ceil(total.value / limit.value))

  const fetchLogs = async (): Promise<void> => {
    if (!selectedDate.value) return
    requestCounter += 1
    const requestId = requestCounter
    loading.value = true
    error.value = ''

    try {
      const { data, error: err } = await get<LogPage>(ApiEndpoint.AdminLogs, {
        date: selectedDate.value,
        offset: offset.value,
        limit: limit.value,
        statusCode: statusCode.value || undefined,
        url: urlFilter.value.trim() || undefined,
        ip: ipFilter.value.trim() || undefined,
      })

      if (requestId !== requestCounter) return

      if (err.value) {
        error.value = err.value
      } else if (data.value) {
        rawLines.value = data.value.lines
        total.value = data.value.total
        offset.value = data.value.offset

        const lastOffset = (totalPages.value - 1) * limit.value
        if (total.value > 0 && offset.value > lastOffset) {
          offset.value = Math.max(0, lastOffset)
          await fetchLogs()
          return
        }
        applyLevelFilter()
      }
    } finally {
      if (requestId === requestCounter) loading.value = false
    }
  }

  const fetchDates = async (): Promise<void> => {
    loading.value = true
    error.value = ''

    try {
      const { data, error: err } = await get<string[]>(ApiEndpoint.AdminLogDates)
      if (err.value) {
        error.value = err.value
        return
      }
      if (data.value?.length) {
        dates.value = data.value
        selectedDate.value = data.value.includes(queryDate) ? queryDate : data.value[0]
        await fetchLogs()
      }
    } finally {
      loading.value = false
    }
  }

  const onDateChange = (): void => {
    offset.value = 0
    fetchLogs()
  }

  const onLimitChange = (): void => {
    offset.value = 0
    fetchLogs()
  }

  const applyFilters = debounce(() => {
    offset.value = 0
    fetchLogs()
  }, FILTER_DEBOUNCE_MS)

  onScopeDispose(applyFilters.cancel)

  const prevPage = (): void => {
    offset.value = Math.max(0, offset.value - limit.value)
    fetchLogs()
  }

  const nextPage = (): void => {
    offset.value += limit.value
    fetchLogs()
  }

  const goToPage = (page: number): void => {
    offset.value = (page - 1) * limit.value
    fetchLogs()
  }

  const syncQuery = (): void => {
    const query: Record<string, string> = {}
    if (selectedDate.value) query.date = selectedDate.value
    if (levelFilter.value) query.level = levelFilter.value
    if (statusCode.value) query.status = statusCode.value
    if (urlFilter.value.trim()) query.url = urlFilter.value.trim()
    if (ipFilter.value.trim()) query.ip = ipFilter.value.trim()
    if (limit.value !== DEFAULT_LIMIT) query.limit = String(limit.value)
    if (currentPage.value > 1) query.page = String(currentPage.value)
    router.replace({ query })
  }

  watch([selectedDate, levelFilter, limit, offset, statusCode, urlFilter, ipFilter], syncQuery)
  watch(levelFilter, applyLevelFilter)
  watch([statusCode, urlFilter, ipFilter], () => applyFilters())

  return {
    dates, selectedDate, parsedLines, offset, limit, total,
    currentPage, totalPages,
    loading, error, levelFilter, urlFilter, ipFilter, statusCode, expandedRow,
    toggleRow, fetchDates, fetchLogs, onDateChange, onLimitChange, prevPage, nextPage, goToPage,
  }
}
