export interface LogReq {
  id?: string
  method?: string
  url?: string
  query?: Record<string, unknown>
  body?: unknown
  headers?: Record<string, string>
  remoteAddress?: string
}

export interface LogRes {
  statusCode?: number
  headers?: Record<string, string>
}

export interface LogEntry {
  level: number
  time: number
  pid?: number
  hostname?: string
  name?: string
  msg?: string
  req?: LogReq
  res?: LogRes
  responseTime?: number
  err?: { type?: string; message?: string; stack?: string }
  [key: string]: unknown
}

const LEVEL_NAMES: Record<number, string> = {
  10: 'TRACE',
  20: 'DEBUG',
  30: 'INFO',
  40: 'WARN',
  50: 'ERROR',
  60: 'FATAL',
}

export const levelName = (level: number): string => LEVEL_NAMES[level] || `LVL ${level}`

export const levelBadge = (level: number): string => {
  if (level >= 50) return 'badge-danger'
  if (level >= 40) return 'badge-warning'
  return 'badge-success'
}

export const statusBadge = (status: number): string => {
  if (status >= 500) return 'badge-danger'
  if (status >= 400) return 'badge-warning'
  if (status >= 200 && status < 300) return 'badge-success'
  return ''
}

export const rowClass = (entry: LogEntry): string => {
  if (entry.level >= 50) return 'row-error'
  if (entry.level >= 40) return 'row-warn'
  return ''
}

export const formatTime = (ts: number): string => {
  if (!ts) return '—'
  const date = new Date(ts)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

export const formatDateTime = (ts: number): string => {
  if (!ts) return '—'
  const date = new Date(ts)
  return date.toLocaleString('ru-RU', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

export const formatJson = (obj: unknown): string => {
  try {
    return JSON.stringify(obj, null, 2)
  } catch {
    return String(obj)
  }
}

const HIDDEN_HEADERS = new Set(['host', 'connection', 'accept-encoding', 'cache-control'])
const MASKED_HEADERS = new Set(['authorization', 'proxy-authorization', 'cookie', 'set-cookie'])

const maskHeaders = (headers: Record<string, string>): Record<string, string> => {
  const filtered: Record<string, string> = {}
  for (const name of Object.keys(headers)) {
    const normalizedName = name.toLowerCase()
    if (!HIDDEN_HEADERS.has(normalizedName)) {
      filtered[name] = MASKED_HEADERS.has(normalizedName) ? '***' : headers[name]
    }
  }
  return filtered
}

export interface HeaderPair {
  name: string
  value: string
}

const headerPairs = (headers: Record<string, string>): HeaderPair[] =>
  Object.entries(maskHeaders(headers))
    .map(([name, value]) => ({ name, value }))
    .toSorted((left, right) => left.name.localeCompare(right.name))

export const reqHeaderPairs = (entry: LogEntry): HeaderPair[] => {
  const headers = entry.req?.headers
  return headers ? headerPairs(headers) : []
}

export const resHeaderPairs = (entry: LogEntry): HeaderPair[] => {
  const headers = entry.res?.headers
  return headers ? headerPairs(headers) : []
}

export const parseLines = (lines: string[]): LogEntry[] => {
  const parsed: LogEntry[] = []
  for (const line of lines) {
    try {
      parsed.push(JSON.parse(line))
    } catch {
      parsed.push({ level: 30, time: 0, msg: line })
    }
  }
  return parsed
}
