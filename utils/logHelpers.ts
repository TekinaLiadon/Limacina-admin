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

export const levelName = (level: number) => LEVEL_NAMES[level] || `LVL ${level}`

export const levelBadge = (level: number) => {
  if (level >= 50) return 'badge-danger'
  if (level >= 40) return 'badge-warning'
  return 'badge-success'
}

export const statusBadge = (status: number) => {
  if (status >= 500) return 'badge-danger'
  if (status >= 400) return 'badge-warning'
  if (status >= 200 && status < 300) return 'badge-success'
  return ''
}

export const rowClass = (entry: LogEntry) => {
  if (entry.level >= 50) return 'row-error'
  if (entry.level >= 40) return 'row-warn'
  return ''
}

export const formatTime = (ts: number) => {
  if (!ts) return '—'
  const d = new Date(ts)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${h}:${m}:${s}`
}

export const formatDateTime = (ts: number) => {
  if (!ts) return '—'
  const d = new Date(ts)
  return d.toLocaleString('ru-RU', {
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

const maskHeaders = (h: Record<string, string>): Record<string, string> => {
  const filtered: Record<string, string> = {}
  for (const k of Object.keys(h)) {
    if (HIDDEN_HEADERS.has(k)) continue
    filtered[k] = MASKED_HEADERS.has(k) ? '***' : h[k]
  }
  return filtered
}

export const formatHeaders = (entry: LogEntry): string => {
  const h = entry.req?.headers
  if (!h || Object.keys(h).length === 0) return ''
  return JSON.stringify(maskHeaders(h))
}

export const formatResHeaders = (entry: LogEntry): string => {
  const h = entry.res?.headers
  if (!h || Object.keys(h).length === 0) return ''
  return JSON.stringify(maskHeaders(h))
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
