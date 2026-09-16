import type { ApiEndpoint } from '~/api/endpoints'
import { isPage, PAGE_FORMAT_ERROR, type Page } from '~/api/types'
import type { QueryParams } from '~/api/query'
import { clampPage, totalPagesOf } from '~/utils/pagination'
import { debounce } from '~/utils/debounce'

const SEARCH_DEBOUNCE_MS = 400

interface UsersListOptions {
  endpoint: ApiEndpoint
  perPage: number
  withSearch?: boolean
  query?: () => QueryParams
}

interface UsersListState<TItem> {
  users: Ref<TItem[]>
  page: Ref<number>
  search: Ref<string>
  total: Ref<number>
  totalPages: ComputedRef<number>
  loading: Ref<boolean>
  error: Ref<string>
  actionError: Ref<string>
  fetchUsers: () => Promise<void>
  goToPage: (target: number) => void
  refetchAfterRemoval: () => Promise<void>
  runUserAction: (
    username: string,
    busy: Ref<string>,
    act: () => Promise<{ error: Ref<string | null> }>,
    onSuccess?: () => Promise<void> | void,
  ) => Promise<void>
}

export const useUsersList = <TItem>({ endpoint, perPage, withSearch = false, query }: UsersListOptions): UsersListState<TItem> => {
  const { get } = useApi()

  const users = ref<TItem[]>([]) as Ref<TItem[]>
  const page = ref(1)
  const search = ref('')
  const total = ref(0)
  const loading = ref(true)
  const error = ref('')
  const actionError = ref('')

  const totalPages = computed(() => totalPagesOf(total.value, perPage))

  const fetchUsers = async (): Promise<void> => {
    loading.value = true
    error.value = ''

    try {
      const { data, error: err } = await get<Page<TItem>>(endpoint, {
        limit: perPage,
        offset: (page.value - 1) * perPage,
        username: withSearch ? search.value.trim() || undefined : undefined,
        ...query?.(),
      })

      if (err.value) {
        error.value = err.value
      } else if (isPage<TItem>(data.value)) {
        users.value = data.value.items
        total.value = data.value.total
        page.value = clampPage(page.value, totalPages.value)
      } else if (data.value) {
        error.value = PAGE_FORMAT_ERROR
      }
    } finally {
      loading.value = false
    }
  }

  const goToPage = (target: number): void => {
    const next = clampPage(target, totalPages.value)
    if (next === page.value) return
    page.value = next
    fetchUsers()
  }

  const applySearch = debounce(() => {
    page.value = 1
    fetchUsers()
  }, SEARCH_DEBOUNCE_MS)

  if (withSearch) watch(search, () => applySearch())
  onScopeDispose(applySearch.cancel)

  const refetchAfterRemoval = async (): Promise<void> => {
    if (users.value.length === 1 && page.value > 1) page.value -= 1
    await fetchUsers()
  }

  const runUserAction = async (
    username: string,
    busy: Ref<string>,
    act: () => Promise<{ error: Ref<string | null> }>,
    onSuccess?: () => Promise<void> | void,
  ): Promise<void> => {
    busy.value = username
    actionError.value = ''

    try {
      const { error: err } = await act()
      if (err.value) {
        actionError.value = err.value
      } else {
        await onSuccess?.()
      }
    } finally {
      busy.value = ''
    }
  }

  return {
    users, page, search, total, totalPages, loading, error, actionError,
    fetchUsers, goToPage, refetchAfterRemoval, runUserAction,
  }
}
