import { capitalize, downloadUrl } from '~/utils/logHelpers'

export const useLauncherVersion = () => {
  const { get } = useApi()
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  const version = ref<any>(null)
  const loading = ref(true)
  const error = ref('')

  const fetchVersion = async () => {
    loading.value = true
    error.value = ''

    try {
      const res = await get<any>('/launcher/version')
      if (res.error.value) {
        error.value = res.error.value
      } else {
        version.value = res.data.value
      }
    } finally {
      loading.value = false
    }
  }

  const getDownloadUrl = (os: string, arch: string) => downloadUrl(apiBase, os, arch)

  return { version, loading, error, fetchVersion, getDownloadUrl, capitalize }
}
