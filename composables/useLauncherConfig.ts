import { ApiEndpoint } from '~/api/endpoints'
import { toFetchError } from '~/api/errors'
import { API_FORMAT_ERROR, isLauncherConfig, type LauncherConfig } from '~/api/types'

export type { LauncherConfig } from '~/api/types'

export interface LauncherConfigForm {
  projectName: string
  mcVersion: string
  modLoader: string
  loaderVersion: string
  minMemory: string
  maxMemory: string
  online: boolean | null
  jvmArgs: string
}

const defaultConfig = (): LauncherConfigForm => ({
  projectName: '',
  mcVersion: '',
  modLoader: '',
  loaderVersion: '',
  minMemory: '',
  maxMemory: '',
  online: null,
  jvmArgs: '',
})

interface LauncherConfigState {
  config: Ref<LauncherConfig | null>
  isNew: Ref<boolean>
  loading: Ref<boolean>
  error: Ref<string>
  form: LauncherConfigForm
  saving: Ref<boolean>
  saveError: Ref<string>
  saveSuccess: Ref<string>
  fetchConfig: () => Promise<void>
  saveConfig: () => Promise<void>
}

export const useLauncherConfig = (): LauncherConfigState => {
  const { get, patch } = useApi()

  const config = ref<LauncherConfig | null>(null)
  const isNew = ref(false)
  const loading = ref(true)
  const error = ref('')
  const form = reactive<LauncherConfigForm>(defaultConfig())

  const saving = ref(false)
  const saveError = ref('')
  const saveSuccess = ref('')

  const fetchConfig = async (): Promise<void> => {
    loading.value = true
    error.value = ''

    try {
      const res = await get<LauncherConfig>(ApiEndpoint.LauncherConfig)

      if (res.error.value && toFetchError(res.cause.value).statusCode !== 404) {
        error.value = res.error.value
      } else if (isLauncherConfig(res.data.value)) {
        config.value = res.data.value
        isNew.value = false
        Object.assign(form, {
          projectName: config.value.projectName,
          mcVersion: config.value.mcVersion,
          modLoader: config.value.modLoader,
          loaderVersion: config.value.loaderVersion,
          minMemory: config.value.minMemory,
          maxMemory: config.value.maxMemory,
          online: config.value.online,
          jvmArgs: config.value.jvmArgs.join(' '),
        })
      } else if (res.data.value) {
        error.value = API_FORMAT_ERROR
      } else {
        isNew.value = true
        Object.assign(form, defaultConfig())
      }
    } finally {
      loading.value = false
    }
  }

  const saveConfig = async (): Promise<void> => {
    saving.value = true
    saveError.value = ''
    saveSuccess.value = ''

    const body = {
      projectName: form.projectName,
      mcVersion: form.mcVersion,
      modLoader: form.modLoader,
      loaderVersion: form.loaderVersion,
      minMemory: form.minMemory,
      maxMemory: form.maxMemory,
      online: form.online,
      jvmArgs: form.jvmArgs.split(/\s+/u).filter(Boolean),
    }

    try {
      const res = await patch<LauncherConfig>(ApiEndpoint.AdminConfig, body)

      if (res.error.value) {
        saveError.value = res.error.value
      } else {
        saveSuccess.value = isNew.value ? 'Конфиг создан' : 'Конфиг обновлён'
        isNew.value = false
        if (res.data.value) config.value = res.data.value
      }
    } finally {
      saving.value = false
    }
  }

  return {
    config, isNew, loading, error, form,
    saving, saveError, saveSuccess,
    fetchConfig, saveConfig,
  }
}
