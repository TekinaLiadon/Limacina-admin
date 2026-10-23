import { ApiEndpoint, endpointUrl } from '~/api/endpoints'
import { API_FORMAT_ERROR, isModsList, type ModFile, type ModsList, type ModsUploaded } from '~/api/types'

interface LauncherModsState {
  mods: Ref<ModFile[]>
  loading: Ref<boolean>
  error: Ref<string>
  uploading: Ref<boolean>
  uploadError: Ref<string>
  uploadSuccess: Ref<string>
  deleting: Ref<string>
  deleteError: Ref<string>
  fetchMods: () => Promise<void>
  uploadMods: (files: File[]) => Promise<void>
  deleteMod: (name: string) => Promise<void>
}

export const useLauncherMods = (): LauncherModsState => {
  const { post, del } = useApi()

  const mods = ref<ModFile[]>([])
  const loading = ref(true)
  const error = ref('')
  const uploading = ref(false)
  const uploadError = ref('')
  const uploadSuccess = ref('')
  const deleting = ref('')
  const deleteError = ref('')

  const fetchMods = useApiResource<ModsList>({
    endpoint: ApiEndpoint.AdminLauncherMods,
    loading,
    error,
    handle: ({ data }) => {
      if (isModsList(data.value)) {
        mods.value = data.value.mods
        return
      }
      if (data.value) error.value = API_FORMAT_ERROR
    },
  })

  const uploadMods = async (files: File[]): Promise<void> => {
    if (files.length === 0) return

    uploading.value = true
    uploadError.value = ''
    uploadSuccess.value = ''

    const body = new FormData()
    for (const file of files) body.append('files', file)

    try {
      const res = await post<ModsUploaded>(ApiEndpoint.AdminLauncherMods, body)

      if (res.error.value) {
        uploadError.value = res.error.value
        return
      }

      uploadSuccess.value = 'Моды загружены'
      await fetchMods(true)
    } finally {
      uploading.value = false
    }
  }

  const deleteMod = async (name: string): Promise<void> => {
    deleting.value = name
    deleteError.value = ''

    try {
      const res = await del(endpointUrl(ApiEndpoint.AdminLauncherMod, { name }))

      if (res.error.value) {
        deleteError.value = res.error.value
        return
      }

      await fetchMods(true)
    } finally {
      deleting.value = ''
    }
  }

  return {
    mods, loading, error,
    uploading, uploadError, uploadSuccess,
    deleting, deleteError,
    fetchMods, uploadMods, deleteMod,
  }
}
