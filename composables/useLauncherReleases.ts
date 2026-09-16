import { ApiEndpoint } from '~/api/endpoints'
import {
  UPDATER_FORMAT_ERROR,
  isUpdaterReleasesList,
  type UpdaterReleaseInfo,
  type UpdaterReleasesList,
} from '~/api/types'

interface LauncherReleasesState {
  releases: Ref<UpdaterReleaseInfo[]>
  loading: Ref<boolean>
  error: Ref<string>
  fetchReleases: (silent?: boolean) => Promise<void>
}

export const useLauncherReleases = (): LauncherReleasesState => {
  const { get } = useApi()

  const releases = ref<UpdaterReleaseInfo[]>([])
  const loading = ref(true)
  const error = ref('')

  const fetchReleases = async (silent = false): Promise<void> => {
    if (!silent) loading.value = true
    error.value = ''

    try {
      const res = await get<UpdaterReleasesList>(ApiEndpoint.LauncherReleases)

      if (res.error.value) {
        error.value = res.error.value
      } else if (isUpdaterReleasesList(res.data.value)) {
        releases.value = res.data.value.releases
      } else {
        error.value = UPDATER_FORMAT_ERROR
      }
    } finally {
      loading.value = false
    }
  }

  return { releases, loading, error, fetchReleases }
}
