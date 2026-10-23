import { ApiEndpoint } from '~/api/endpoints'
import type { FetchResource } from '~/composables/useApiResource'
import type { UpdaterLatest } from '~/api/types'

interface LauncherLatestState {
  latest: Ref<UpdaterLatest | null>
  preview: Ref<UpdaterLatest | null>
  previewVersion: Ref<string>
  loading: Ref<boolean>
  previewLoading: Ref<boolean>
  error: Ref<string>
  previewError: Ref<string>
  fetchLatest: FetchResource
  viewVersion: (version: string) => Promise<void>
  clearPreview: () => void
}

export const useLauncherLatest = (): LauncherLatestState => {
  const { get } = useApi()

  const latest = ref<UpdaterLatest | null>(null)
  const preview = ref<UpdaterLatest | null>(null)
  const previewVersion = ref('')
  const loading = ref(true)
  const previewLoading = ref(false)
  const error = ref('')
  const previewError = ref('')

  const fetchLatest = useApiResource<UpdaterLatest>({
    endpoint: ApiEndpoint.LauncherLatest,
    loading,
    error,
    tolerate404: true,
    handle: ({ data, is404 }) => {
      latest.value = is404 ? null : data.value
    },
  })

  let previewRequest = 0

  const viewVersion = async (version: string): Promise<void> => {
    previewRequest += 1
    const requestId = previewRequest
    previewVersion.value = version
    preview.value = null
    previewError.value = ''
    previewLoading.value = true

    try {
      const { data, error: err } = await get<UpdaterLatest>(ApiEndpoint.LauncherLatest, { version })
      if (requestId !== previewRequest) return
      if (err.value) {
        previewError.value = err.value
      } else {
        preview.value = data.value
      }
    } finally {
      if (requestId === previewRequest) previewLoading.value = false
    }
  }

  const clearPreview = (): void => {
    previewRequest += 1
    previewVersion.value = ''
    preview.value = null
    previewError.value = ''
    previewLoading.value = false
  }

  return { latest, preview, previewVersion, loading, previewLoading, error, previewError, fetchLatest, viewVersion, clearPreview }
}
