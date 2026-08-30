import { type LogEntry, parseLines } from '~/utils/logHelpers'
import { ApiEndpoint } from '~/api/endpoints'
import type { LogPage } from '~/api/types'

export const useLogs = () => {
  const { get } = useApi()

  const dates = ref<string[]>([])
  const selectedDate = ref('')
  const parsedLines = ref<LogEntry[]>([])
  const rawLines = ref<string[]>([])
  const offset = ref(0)
  const limit = ref(100)
  const total = ref(0)
  const loading = ref(true)
  const error = ref('')
  const levelFilter = ref('')
  const expandedRow = ref<number | null>(null)

  const toggleRow = (i: number) => {
    expandedRow.value = expandedRow.value === i ? null : i
  }

  const applyLevelFilter = () => {
    const all = parseLines(rawLines.value)
    if (levelFilter.value) {
      parsedLines.value = all.filter((e) => e.level === Number(levelFilter.value))
    } else {
      parsedLines.value = all
    }
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
        selectedDate.value = data.value[0]
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

  watch(levelFilter, () => {
    applyLevelFilter()
  })

  return {
    dates, selectedDate, parsedLines, offset, limit, total,
    currentPage, totalPages,
    loading, error, levelFilter, expandedRow,
    toggleRow, fetchDates, fetchLogs, onDateChange, prevPage, nextPage, goToPage,
  }
}
