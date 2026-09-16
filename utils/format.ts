export const formatDate = (date?: string): string => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export const capitalize = (value: string): string => value ? value.charAt(0).toUpperCase() + value.slice(1) : value
