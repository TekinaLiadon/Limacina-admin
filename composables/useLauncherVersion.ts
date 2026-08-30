import { ApiEndpoint } from '~/api/endpoints'
import type { LauncherVersion } from '~/api/types'

export const useLauncherVersion = () => {
  const { get } = useApi()

  const version = ref<LauncherVersion | null>(null)
  const loading = ref(true)
  const error = ref('')

  const fetchVersion = async () => {
    loading.value = true
    error.value = ''

    try {
      const res = await get<LauncherVersion>(ApiEndpoint.LauncherVersion)
      if (res.error.value) {
        error.value = res.error.value
      } else {
        version.value = res.data.value
      }
    } finally {
      loading.value = false
    }
  }

  return { version, loading, error, fetchVersion }
}
