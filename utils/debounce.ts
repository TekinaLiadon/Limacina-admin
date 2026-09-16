export interface DebouncedFunction<TArgs extends unknown[]> {
  (...args: TArgs): void
  cancel: () => void
}

export const debounce = <TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  delay: number,
): DebouncedFunction<TArgs> => {
  let timer: ReturnType<typeof setTimeout> | undefined = undefined

  const debounced = (...args: TArgs): void => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }

  debounced.cancel = (): void => {
    clearTimeout(timer)
  }

  return debounced
}
