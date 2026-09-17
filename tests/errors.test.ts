import { describe, it, expect } from 'vitest'
import { toFetchError, fetchErrorMessage } from '~/api/errors'

describe('toFetchError', () => {
  it('passes error objects through', () => {
    const failure = { statusCode: 404, data: { message: 'nope' } }

    expect(toFetchError(failure)).toBe(failure)
  })

  it('returns an empty object for non-objects', () => {
    expect(toFetchError('boom')).toStrictEqual({})
    expect(toFetchError(null)).toStrictEqual({})
  })
})

describe('fetchErrorMessage', () => {
  it('extracts a string message from data', () => {
    expect(fetchErrorMessage({ data: { message: 'nope' } })).toBe('nope')
  })

  it('takes the first entry of a message array', () => {
    expect(fetchErrorMessage({ data: { message: ['limit must be positive', 'limit must be an integer'] } })).toBe('limit must be positive')
  })

  it('falls back to errorMessage when message is missing', () => {
    expect(fetchErrorMessage({ data: { errorMessage: 'fallback' } })).toBe('fallback')
  })

  it('falls back to the top-level message', () => {
    expect(fetchErrorMessage({ message: 'plain message' })).toBe('plain message')
  })

  it('returns an empty data message as is', () => {
    expect(fetchErrorMessage({ data: { message: '' }, message: 'plain message' })).toBe('')
  })

  it('returns undefined for non-objects', () => {
    expect(fetchErrorMessage('boom')).toBeUndefined()
    expect(fetchErrorMessage(null)).toBeUndefined()
  })

  it('returns undefined when no message is present', () => {
    expect(fetchErrorMessage({ statusCode: 500 })).toBeUndefined()
    expect(fetchErrorMessage({})).toBeUndefined()
  })
})
