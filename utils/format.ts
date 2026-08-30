export const formatDate = (date?: string): string => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s
