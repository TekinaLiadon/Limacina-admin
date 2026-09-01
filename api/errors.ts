export interface FetchErrorLike {
  statusCode?: number
  data?: { message?: string | string[]; errorMessage?: string }
  message?: string
}

const firstMessage = (message: string | string[] | undefined): string | undefined =>
  Array.isArray(message) ? message[0] : message

export const fetchErrorMessage = (e: unknown): string | undefined => {
  if (typeof e !== 'object' || e === null) return undefined
  const { data, message } = e as FetchErrorLike
  return firstMessage(data?.message) ?? data?.errorMessage ?? firstMessage(message)
}

export const toFetchError = (e: unknown): FetchErrorLike =>
  typeof e === 'object' && e !== null ? (e as FetchErrorLike) : {}
