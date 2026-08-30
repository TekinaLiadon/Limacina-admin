import { ApiEndpoint } from '~/api/endpoints'
import type { LauncherVersion } from '~/api/types'

export interface LauncherUploadForm {
  version: string
  linuxX86: File | null
  linuxArm: File | null
  windowsX86: File | null
}

export const useLauncherUpload = () => {
  const { get, patch } = useApi()

  const form = reactive<LauncherUploadForm>({
    version: '',
    linuxX86: null,
    linuxArm: null,
    windowsX86: null,
  })

  const uploading = ref(false)
  const uploadError = ref('')
  const uploadSuccess = ref('')

  const uploadLauncher = async (onVersionUpdate: (v: LauncherVersion) => void) => {
    uploading.value = true
    uploadError.value = ''
    uploadSuccess.value = ''

    const formData = new FormData()
    formData.append('version', form.version)

    if (form.linuxX86) formData.append('linux_x86_64', form.linuxX86)
    if (form.linuxArm) formData.append('linux_aarch64', form.linuxArm)
    if (form.windowsX86) formData.append('windows_x86_64', form.windowsX86)

    const res = await patch(ApiEndpoint.AdminLauncher, formData)

    if (res.error.value) {
      uploadError.value = res.error.value
    } else {
      uploadSuccess.value = 'Лаунчер обновлён'
      form.linuxX86 = null
      form.linuxArm = null
      form.windowsX86 = null

      const versionRes = await get<LauncherVersion>(ApiEndpoint.LauncherVersion)
      if (versionRes.data.value) onVersionUpdate(versionRes.data.value)
    }

    uploading.value = false
  }

  return { form, uploading, uploadError, uploadSuccess, uploadLauncher }
}
