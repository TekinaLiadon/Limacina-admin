import { ApiEndpoint } from '~/api/endpoints'
import type { FetchResource } from '~/composables/useApiResource'
import {
  API_FORMAT_ERROR,
  isUpdaterReleasesList,
  type UpdaterReleaseInfo,
  type UpdaterReleasesList,
} from '~/api/types'

interface LauncherReleasesState {
  releases: Ref<UpdaterReleaseInfo[]>
  loading: Ref<boolean>
  error: Ref<string>
  fetchReleases: FetchResource
}

export const useLauncherReleases = (): LauncherReleasesState => {
  const releases = ref<UpdaterReleaseInfo[]>([])
  const loading = ref(true)
  const error = ref('')

  const fetchReleases = useApiResource<UpdaterReleasesList>({
    endpoint: ApiEndpoint.LauncherReleases,
    loading,
    error,
    handle: ({ data }) => {
      if (isUpdaterReleasesList(data.value)) {
        releases.value = data.value.releases
      } else {
        error.value = API_FORMAT_ERROR
      }
    },
  })

  return { releases, loading, error, fetchReleases }
}
