const INSTALL_ID_SEARCH_PATTERN = /^[0-9a-fv-]{1,35}$/iu
const INSTALL_ID_DISALLOWED_PATTERN = /[^0-9a-fv-]/giu
export const INSTALL_ID_SEARCH_MAX_LENGTH = 35

export const normalizeInstallIdSearch = (value: string): string => {
  const trimmed = value.trim()
  return INSTALL_ID_SEARCH_PATTERN.test(trimmed) ? trimmed : ''
}

export const sanitizeInstallIdInput = (value: string): string =>
  value.replaceAll(INSTALL_ID_DISALLOWED_PATTERN, '').slice(0, INSTALL_ID_SEARCH_MAX_LENGTH)
