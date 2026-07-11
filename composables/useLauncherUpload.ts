export interface LauncherUploadForm {
  version: string
  linuxX86: File | null
  linuxArm: File | null
  windowsX86: File | null
}

export const useLauncherUpload = () => {
  const { get } = useApi()
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  const form = reactive<LauncherUploadForm>({
    version: '',
    linuxX86: null,
    linuxArm: null,
    windowsX86: null,
  })

  const uploading = ref(false)
  const uploadError = ref('')
  const uploadSuccess = ref('')

  const uploadLauncher = async (onVersionUpdate: (v: any) => void) => {
    uploading.value = true
    uploadError.value = ''
    uploadSuccess.value = ''

    try {
      const formData = new FormData()
      formData.append('version', form.version)

      if (form.linuxX86) formData.append('linux_x86_64', form.linuxX86)
      if (form.linuxArm) formData.append('linux_aarch64', form.linuxArm)
      if (form.windowsX86) formData.append('windows_x86_64', form.windowsX86)

      const token = useCookie('auth_token')
      await $fetch(`${apiBase}/admin/launcher`, {
        method: 'PATCH',
        headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
        body: formData,
      })

      uploadSuccess.value = 'Лаунчер обновлён'
      form.linuxX86 = null
      form.linuxArm = null
      form.windowsX86 = null

      const versionRes = await get<any>('/launcher/version')
      if (versionRes.data.value) onVersionUpdate(versionRes.data.value)
    } catch (e: any) {
      uploadError.value = e?.data?.errorMessage || e?.message || 'Ошибка загрузки'
    } finally {
      uploading.value = false
    }
  }

  return { form, uploading, uploadError, uploadSuccess, uploadLauncher }
}
