import { describe, it, expect, vi, afterEach } from 'vitest'
import { debounce } from '~/utils/debounce'

afterEach(() => {
  vi.useRealTimers()
})

describe('debounce', () => {
  it('invokes once for a burst of calls', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 400)

    debounced()
    debounced()
    debounced()
    vi.advanceTimersByTime(400)

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('delays invocation until the pause after the last call', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 400)

    debounced()
    vi.advanceTimersByTime(300)
    debounced()
    vi.advanceTimersByTime(300)

    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('passes arguments through', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 400)

    debounced('a', 1)
    vi.advanceTimersByTime(400)

    expect(fn).toHaveBeenCalledWith('a', 1)
  })

  it('cancels a pending invocation', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 400)

    debounced()
    debounced.cancel()
    vi.advanceTimersByTime(400)

    expect(fn).not.toHaveBeenCalled()
  })
})
