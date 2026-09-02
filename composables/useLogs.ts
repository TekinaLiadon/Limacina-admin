import { type LogEntry, parseLines } from '~/utils/logHelpers'
import { ApiEndpoint } from '~/api/endpoints'
import type { LogPage } from '~/api/types'
import { debounce } from '~/utils/debounce'

const LEVELS = ['10', '20', '30', '40', '50', '60']
const LIMITS = [100, 250, 500, 1000]
const DEFAULT_LIMIT = 100
const FILTER_DEBOUNCE_MS = 400

const queryString = (value: unknown) => (typeof value === 'string' ? value : '')

export const useLogs = () => {
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
  if (LEVELS.includes(queryLevel)) levelFilter.value = queryLevel

  const queryLimit = Number(queryString(route.query.limit))
  if (LIMITS.includes(queryLimit)) limit.value = queryLimit

  const queryStatus = queryString(route.query.status)
  if (/^\d{3}$/.test(queryStatus)) statusCode.value = queryStatus

  const queryUrl = queryString(route.query.url)
  if (queryUrl) urlFilter.value = queryUrl

  const queryIp = queryString(route.query.ip)
  if (queryIp) ipFilter.value = queryIp

  const queryDate = queryString(route.query.date)
  const queryPage = Number(queryString(route.query.page))
  if (Number.isInteger(queryPage) && queryPage > 1) {
    offset.value = (queryPage - 1) * limit.value
  }

  const toggleRow = (i: number) => {
    expandedRow.value = expandedRow.value === i ? null : i
  }

  const applyLevelFilter = () => {
    let entries = parseLines(rawLines.value)
    if (levelFilter.value) {
      entries = entries.filter((e) => e.level === Number(levelFilter.value))
    }
    parsedLines.value = entries
  }

  const fetchLogs = async () => {
    if (!selectedDate.value) return
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

      if (err.value) {
        error.value = err.value
      } else if (data.value) {
        rawLines.value = data.value.lines
        total.value = data.value.total
        offset.value = data.value.offset
        applyLevelFilter()
      }
    } finally {
      loading.value = false
    }
  }

  const fetchDates = async () => {
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

  const onDateChange = () => {
    offset.value = 0
    fetchLogs()
  }

  const applyFilters = debounce(() => {
    offset.value = 0
    fetchLogs()
  }, FILTER_DEBOUNCE_MS)

  onScopeDispose(applyFilters.cancel)

  const prevPage = () => {
    offset.value = Math.max(0, offset.value - limit.value)
    fetchLogs()
  }

  const nextPage = () => {
    offset.value += limit.value
    fetchLogs()
  }

  const goToPage = (page: number) => {
    offset.value = (page - 1) * limit.value
    fetchLogs()
  }

  const currentPage = computed(() => Math.floor(offset.value / limit.value) + 1)
  const totalPages = computed(() => Math.ceil(total.value / limit.value))

  const syncQuery = () => {
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
    toggleRow, fetchDates, fetchLogs, onDateChange, prevPage, nextPage, goToPage,
  }
}
