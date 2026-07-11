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

export const LEVEL_NAMES: Record<number, string> = {
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

export const formatParams = (entry: LogEntry): string => {
  const parts: string[] = []
  const q = entry.req?.query
  if (q && Object.keys(q).length > 0) {
    parts.push(JSON.stringify(q))
  }
  const b = entry.req?.body
  if (b !== undefined && b !== null) {
    parts.push(typeof b === 'string' ? b : JSON.stringify(b))
  }
  return parts.join(' ')
}

export const formatHeaders = (entry: LogEntry): string => {
  const h = entry.req?.headers
  if (!h) return ''
  const keys = Object.keys(h)
  if (keys.length === 0) return ''
  const filtered: Record<string, string> = {}
  for (const k of keys) {
    if (k === 'host' || k === 'connection' || k === 'accept-encoding' || k === 'cache-control') continue
    filtered[k] = h[k]
  }
  return JSON.stringify(filtered)
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

export const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s

export const downloadUrl = (apiBase: string, os: string, arch: string) => `${apiBase}/launcher/${os}/${arch}/download`
