import { ApiEndpoint } from '~/api/endpoints'
import type { FetchResource } from '~/composables/useApiResource'
import type { UpdaterLatest } from '~/api/types'

interface LauncherLatestState {
  latest: Ref<UpdaterLatest | null>
  loading: Ref<boolean>
  error: Ref<string>
  fetchLatest: FetchResource
}

export const useLauncherLatest = (): LauncherLatestState => {
  const latest = ref<UpdaterLatest | null>(null)
  const loading = ref(true)
  const error = ref('')

  const fetchLatest = useApiResource<UpdaterLatest>({
    endpoint: ApiEndpoint.LauncherLatest,
    loading,
    error,
    tolerate404: true,
    handle: ({ data, is404 }) => {
      latest.value = is404 ? null : data.value
    },
  })

  return { latest, loading, error, fetchLatest }
}
