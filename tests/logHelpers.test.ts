import { describe, it, expect } from 'vitest'
import {
  levelName, levelBadge, statusBadge, rowClass,
  formatTime, formatDateTime, formatJson,
  formatParams, formatHeaders, parseLines,
  capitalize, downloadUrl,
  type LogEntry,
} from '../utils/logHelpers'

describe('levelName', () => {
  it('returns name for known levels', () => {
    expect(levelName(10)).toBe('TRACE')
    expect(levelName(20)).toBe('DEBUG')
    expect(levelName(30)).toBe('INFO')
    expect(levelName(40)).toBe('WARN')
    expect(levelName(50)).toBe('ERROR')
    expect(levelName(60)).toBe('FATAL')
  })

  it('returns fallback for unknown level', () => {
    expect(levelName(0)).toBe('LVL 0')
    expect(levelName(99)).toBe('LVL 99')
  })
})

describe('levelBadge', () => {
  it('returns badge-danger for level >= 50', () => {
    expect(levelBadge(50)).toBe('badge-danger')
    expect(levelBadge(60)).toBe('badge-danger')
  })

  it('returns badge-warning for level 40-49', () => {
    expect(levelBadge(40)).toBe('badge-warning')
    expect(levelBadge(45)).toBe('badge-warning')
  })

  it('returns badge-success for level < 40', () => {
    expect(levelBadge(10)).toBe('badge-success')
    expect(levelBadge(20)).toBe('badge-success')
    expect(levelBadge(30)).toBe('badge-success')
  })
})

describe('statusBadge', () => {
  it('returns badge-danger for 5xx', () => {
    expect(statusBadge(500)).toBe('badge-danger')
    expect(statusBadge(503)).toBe('badge-danger')
  })

  it('returns badge-warning for 4xx', () => {
    expect(statusBadge(400)).toBe('badge-warning')
    expect(statusBadge(404)).toBe('badge-warning')
  })

  it('returns badge-success for 2xx', () => {
    expect(statusBadge(200)).toBe('badge-success')
    expect(statusBadge(201)).toBe('badge-success')
    expect(statusBadge(204)).toBe('badge-success')
  })

  it('returns empty string for other codes', () => {
    expect(statusBadge(100)).toBe('')
    expect(statusBadge(301)).toBe('')
  })
})

describe('rowClass', () => {
  it('returns row-error for level >= 50', () => {
    expect(rowClass({ level: 50, time: 0 })).toBe('row-error')
    expect(rowClass({ level: 60, time: 0 })).toBe('row-error')
  })

  it('returns row-warn for level 40-49', () => {
    expect(rowClass({ level: 40, time: 0 })).toBe('row-warn')
  })

  it('returns empty string for level < 40', () => {
    expect(rowClass({ level: 10, time: 0 })).toBe('')
    expect(rowClass({ level: 30, time: 0 })).toBe('')
  })
})

describe('formatTime', () => {
  it('formats timestamp to HH:MM:SS', () => {
    const ts = new Date(2025, 0, 15, 9, 5, 30).getTime()
    expect(formatTime(ts)).toBe('09:05:30')
  })

  it('pads single digits', () => {
    const ts = new Date(2025, 0, 1, 0, 0, 0).getTime()
    expect(formatTime(ts)).toBe('00:00:00')
  })

  it('returns dash for falsy values', () => {
    expect(formatTime(0)).toBe('—')
    expect(formatTime(undefined as any)).toBe('—')
  })
})

describe('formatDateTime', () => {
  it('returns dash for falsy values', () => {
    expect(formatDateTime(0)).toBe('—')
  })

  it('formats timestamp to localized date-time string', () => {
    const ts = new Date(2025, 5, 15, 14, 30, 0).getTime()
    const result = formatDateTime(ts)
    expect(result).toContain('2025')
    expect(result).toContain('14')
    expect(result).toContain('30')
  })
})

describe('formatJson', () => {
  it('pretty-prints objects', () => {
    const result = formatJson({ a: 1, b: 'two' })
    expect(result).toContain('"a": 1')
    expect(result).toContain('"b": "two"')
    expect(result).toContain('\n')
  })

  it('handles strings', () => {
    expect(formatJson('hello')).toBe('"hello"')
  })

  it('handles numbers', () => {
    expect(formatJson(42)).toBe('42')
  })
})

describe('formatParams', () => {
  it('returns empty string when no req', () => {
    expect(formatParams({ level: 30, time: 0 })).toBe('')
  })

  it('formats query params', () => {
    const entry: LogEntry = {
      level: 30,
      time: 0,
      req: { query: { page: 1, limit: 10 } },
    }
    const result = formatParams(entry)
    expect(result).toContain('"page":1')
    expect(result).toContain('"limit":10')
  })

  it('formats body as JSON', () => {
    const entry: LogEntry = {
      level: 30,
      time: 0,
      req: { body: { username: 'admin' } },
    }
    const result = formatParams(entry)
    expect(result).toContain('"username":"admin"')
  })

  it('formats body as string', () => {
    const entry: LogEntry = {
      level: 30,
      time: 0,
      req: { body: 'raw data' },
    }
    expect(formatParams(entry)).toBe('raw data')
  })

  it('combines query and body', () => {
    const entry: LogEntry = {
      level: 30,
      time: 0,
      req: { query: { id: 1 }, body: { name: 'test' } },
    }
    const result = formatParams(entry)
    expect(result).toContain('"id":1')
    expect(result).toContain('"name":"test"')
  })
})

describe('formatHeaders', () => {
  it('returns empty string when no headers', () => {
    expect(formatHeaders({ level: 30, time: 0 })).toBe('')
  })

  it('returns empty string for empty headers', () => {
    const entry: LogEntry = { level: 30, time: 0, req: { headers: {} } }
    expect(formatHeaders(entry)).toBe('')
  })

  it('filters out host, connection, accept-encoding, cache-control', () => {
    const entry: LogEntry = {
      level: 30,
      time: 0,
      req: {
        headers: {
          host: 'example.com',
          connection: 'keep-alive',
          'accept-encoding': 'gzip',
          'cache-control': 'no-cache',
          'content-type': 'application/json',
          authorization: 'Bearer xxx',
        },
      },
    }
    const result = JSON.parse(formatHeaders(entry))
    expect(result).not.toHaveProperty('host')
    expect(result).not.toHaveProperty('connection')
    expect(result).not.toHaveProperty('accept-encoding')
    expect(result).not.toHaveProperty('cache-control')
    expect(result).toHaveProperty('content-type')
    expect(result).toHaveProperty('authorization')
  })
})

describe('parseLines', () => {
  it('parses valid JSON lines', () => {
    const lines = [
      '{"level":30,"time":1000,"msg":"hello"}',
      '{"level":40,"time":2000,"msg":"warn"}',
    ]
    const result = parseLines(lines)
    expect(result).toHaveLength(2)
    expect(result[0].level).toBe(30)
    expect(result[0].msg).toBe('hello')
    expect(result[1].level).toBe(40)
  })

  it('handles invalid JSON gracefully', () => {
    const lines = ['not json', '{"level":30,"time":0}']
    const result = parseLines(lines)
    expect(result).toHaveLength(2)
    expect(result[0].level).toBe(30)
    expect(result[0].time).toBe(0)
    expect(result[0].msg).toBe('not json')
    expect(result[1].level).toBe(30)
  })

  it('returns empty array for empty input', () => {
    expect(parseLines([])).toEqual([])
  })
})

describe('capitalize', () => {
  it('capitalizes first letter', () => {
    expect(capitalize('linux')).toBe('Linux')
    expect(capitalize('windows')).toBe('Windows')
  })

  it('does not change already capitalized', () => {
    expect(capitalize('Linux')).toBe('Linux')
  })

  it('returns empty string for empty input', () => {
    expect(capitalize('')).toBe('')
  })
})

describe('downloadUrl', () => {
  it('builds correct URL', () => {
    expect(downloadUrl('/api', 'linux', 'x86_64')).toBe('/api/launcher/linux/x86_64/download')
    expect(downloadUrl('/api', 'windows', 'x86_64')).toBe('/api/launcher/windows/x86_64/download')
  })
})
