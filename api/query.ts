export type QueryValue = string | number | boolean | null | undefined
export type QueryParams = Record<string, QueryValue>

export const buildQuery = (query?: QueryParams): string => {
  if (!query) return ''

  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined || value === '') continue
    search.append(key, String(value))
  }

  const serialized = search.toString()
  return serialized ? `?${serialized}` : ''
}
