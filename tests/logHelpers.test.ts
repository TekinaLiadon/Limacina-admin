import { describe, it, expect } from 'vitest'
import {
  levelName, levelBadge, statusBadge, rowClass,
  formatTime, formatDateTime, formatJson,
  reqHeaderPairs, resHeaderPairs, parseLines,
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
    expect(formatTime(undefined as unknown as number)).toBe('—')
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

describe('reqHeaderPairs', () => {
  it('returns empty array when no headers', () => {
    expect(reqHeaderPairs({ level: 30, time: 0 })).toEqual([])
  })

  it('returns empty array for empty headers', () => {
    const entry: LogEntry = { level: 30, time: 0, req: { headers: {} } }
    expect(reqHeaderPairs(entry)).toEqual([])
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
    const names = reqHeaderPairs(entry).map((h) => h.name)
    expect(names).not.toContain('host')
    expect(names).not.toContain('connection')
    expect(names).not.toContain('accept-encoding')
    expect(names).not.toContain('cache-control')
    expect(names).toContain('content-type')
    expect(names).toContain('authorization')
  })

  it('masks authorization and cookie values', () => {
    const entry: LogEntry = {
      level: 30,
      time: 0,
      req: {
        headers: {
          authorization: 'Bearer secret-token',
          cookie: 'session=secret',
          'content-type': 'application/json',
        },
      },
    }
    const pairs = reqHeaderPairs(entry)
    expect(pairs.find((h) => h.name === 'authorization')?.value).toBe('***')
    expect(pairs.find((h) => h.name === 'cookie')?.value).toBe('***')
    expect(pairs.find((h) => h.name === 'content-type')?.value).toBe('application/json')
  })

  it('sorts headers by name', () => {
    const entry: LogEntry = {
      level: 30,
      time: 0,
      req: {
        headers: {
          'user-agent': 'curl',
          'content-type': 'application/json',
          accept: '*/*',
        },
      },
    }
    expect(reqHeaderPairs(entry).map((h) => h.name)).toEqual(['accept', 'content-type', 'user-agent'])
  })
})

describe('resHeaderPairs', () => {
  it('returns empty array when no res', () => {
    expect(resHeaderPairs({ level: 30, time: 0 })).toEqual([])
  })

  it('returns empty array for empty headers', () => {
    const entry: LogEntry = { level: 30, time: 0, res: { headers: {} } }
    expect(resHeaderPairs(entry)).toEqual([])
  })

  it('masks set-cookie values', () => {
    const entry: LogEntry = {
      level: 30,
      time: 0,
      res: {
        statusCode: 200,
        headers: {
          'set-cookie': 'sid=secret-session-id',
          'content-type': 'application/json',
        },
      },
    }
    const pairs = resHeaderPairs(entry)
    expect(pairs.find((h) => h.name === 'set-cookie')?.value).toBe('***')
    expect(pairs.find((h) => h.name === 'content-type')?.value).toBe('application/json')
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
