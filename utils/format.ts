const BYTE_UNITS = ['КБ', 'МБ', 'ГБ'] as const

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} Б`

  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < BYTE_UNITS.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${Number(value.toFixed(1))} ${BYTE_UNITS[unit]}`
}

export const formatDate = (date?: string): string => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
