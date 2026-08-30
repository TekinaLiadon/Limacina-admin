export interface FetchErrorLike {
  statusCode?: number
  data?: { errorMessage?: string }
  message?: string
}

export const toFetchError = (e: unknown): FetchErrorLike =>
  typeof e === 'object' && e !== null ? (e as FetchErrorLike) : {}
