import { describe, it, expect } from 'vitest'
import {
  normalizeRconCommand,
  filterRconCommandHints,
  isRconOutputEmpty,
} from '~/utils/rconHelpers'

describe('normalizeRconCommand', () => {
  it('passes a plain command through', () => {
    expect(normalizeRconCommand('say hello')).toBe('say hello')
  })

  it('trims surrounding whitespace', () => {
    expect(normalizeRconCommand('  say hello\t')).toBe('say hello')
  })

  it('strips a single leading slash', () => {
    expect(normalizeRconCommand('/list')).toBe('list')
  })

  it('strips several leading slashes', () => {
    expect(normalizeRconCommand('///list')).toBe('list')
  })

  it('strips a slash separated from the command by spaces', () => {
    expect(normalizeRconCommand('/ list')).toBe('list')
  })

  it('keeps inner slashes', () => {
    expect(normalizeRconCommand('tellraw @a hello/world')).toBe('tellraw @a hello/world')
  })

  it('collapses slash-only input to an empty string', () => {
    expect(normalizeRconCommand('')).toBe('')
    expect(normalizeRconCommand('   ')).toBe('')
    expect(normalizeRconCommand('/')).toBe('')
    expect(normalizeRconCommand(' // ')).toBe('')
  })
})

describe('filterRconCommandHints', () => {
  const commands = ['say', 'list', 'stop', 'seed', 'SayHi']

  it('filters by case-insensitive prefix keeping the source order', () => {
    expect(filterRconCommandHints(commands, 's')).toStrictEqual(['say', 'stop', 'seed', 'SayHi'])
  })

  it('matches an uppercase input against lowercase hints', () => {
    expect(filterRconCommandHints(commands, 'LI')).toStrictEqual(['list'])
  })

  it('matches a lowercase input against mixed-case hints', () => {
    expect(filterRconCommandHints(commands, 'sayh')).toStrictEqual(['SayHi'])
  })

  it('treats a leading slash as part of the prefix', () => {
    expect(filterRconCommandHints(commands, '/st')).toStrictEqual(['stop'])
  })

  it('ignores trailing whitespace in the input', () => {
    expect(filterRconCommandHints(commands, 'list ')).toStrictEqual(['list'])
  })

  it('returns every hint matching a full command prefix', () => {
    expect(filterRconCommandHints(commands, 'say')).toStrictEqual(['say', 'SayHi'])
  })

  it('hides hints for an empty input', () => {
    expect(filterRconCommandHints(commands, '')).toStrictEqual([])
    expect(filterRconCommandHints(commands, '   ')).toStrictEqual([])
    expect(filterRconCommandHints(commands, '/')).toStrictEqual([])
  })

  it('returns nothing when no hint matches', () => {
    expect(filterRconCommandHints(commands, 'ban')).toStrictEqual([])
  })

  it('returns nothing for an empty command list', () => {
    expect(filterRconCommandHints([], 'list')).toStrictEqual([])
  })
})

describe('isRconOutputEmpty', () => {
  it('treats an empty and whitespace-only output as empty', () => {
    expect(isRconOutputEmpty('')).toBeTruthy()
    expect(isRconOutputEmpty('   ')).toBeTruthy()
    expect(isRconOutputEmpty('\n\t')).toBeTruthy()
  })

  it('treats any visible output as non-empty', () => {
    expect(isRconOutputEmpty('Сервер: hello')).toBeFalsy()
    expect(isRconOutputEmpty('0')).toBeFalsy()
  })
})
