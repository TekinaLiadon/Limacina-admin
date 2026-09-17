export const totalPagesOf = (total: number, perPage: number): number =>
  total > 0 ? Math.ceil(total / perPage) : 0

export const clampPage = (page: number, totalPages: number): number =>
  Math.min(Math.max(1, page), Math.max(1, totalPages))

export const pageNumbers = (currentPage: number, totalPages: number): (number | string)[] => {
  const pages: (number | string)[] = []

  if (totalPages <= 7) {
    for (let page = 1; page <= totalPages; page += 1) pages.push(page)
    return pages
  }

  pages.push(1)

  if (currentPage > 3) pages.push('...')

  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  for (let page = start; page <= end; page += 1) pages.push(page)

  if (currentPage < totalPages - 2) pages.push('...')

  pages.push(totalPages)

  return pages
}
