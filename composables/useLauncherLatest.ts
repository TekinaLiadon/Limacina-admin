import { ApiEndpoint } from '~/api/endpoints'
import { toFetchError } from '~/api/errors'
import type { UpdaterLatest } from '~/api/types'

interface LauncherLatestState {
  latest: Ref<UpdaterLatest | null>
  loading: Ref<boolean>
  error: Ref<string>
  fetchLatest: (silent?: boolean) => Promise<void>
}

export const useLauncherLatest = (): LauncherLatestState => {
  const { get } = useApi()

  const latest = ref<UpdaterLatest | null>(null)
  const loading = ref(true)
  const error = ref('')

  const fetchLatest = async (silent = false): Promise<void> => {
    if (!silent) loading.value = true
    error.value = ''

    try {
      const res = await get<UpdaterLatest>(ApiEndpoint.LauncherLatest)
      if (res.error.value && toFetchError(res.cause.value).statusCode !== 404) {
        error.value = res.error.value
      } else {
        latest.value = res.error.value ? null : res.data.value
      }
    } finally {
      loading.value = false
    }
  }

  return { latest, loading, error, fetchLatest }
}
