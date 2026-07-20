export interface LauncherConfig {
  projectName: string
  mcVersion: string
  modLoader: string
  loaderVersion: string
  minMemory: string
  maxMemory: string
  online: boolean | null
  jvmArgs: string
}

const defaultConfig = (): LauncherConfig => ({
  projectName: '',
  mcVersion: '',
  modLoader: '',
  loaderVersion: '',
  minMemory: '',
  maxMemory: '',
  online: null,
  jvmArgs: '',
})

export const useLauncherConfig = () => {
  const { get, post, patch } = useApi()

  const config = ref<any>(null)
  const isNew = ref(false)
  const loading = ref(true)
  const error = ref('')
  const form = reactive<LauncherConfig>(defaultConfig())

  const saving = ref(false)
  const saveError = ref('')
  const saveSuccess = ref('')

  const fetchConfig = async () => {
    loading.value = true
    error.value = ''

    try {
      const res = await get<any>('/launcher/config')

      if (res.data.value) {
        config.value = res.data.value
        isNew.value = false
        Object.assign(form, {
          projectName: config.value.projectName || '',
          mcVersion: config.value.mcVersion || '',
          modLoader: config.value.modLoader || '',
          loaderVersion: config.value.loaderVersion || '',
          minMemory: config.value.minMemory || '',
          maxMemory: config.value.maxMemory || '',
          online: config.value.online ?? null,
          jvmArgs: config.value.jvmArgs?.join(' ') || '',
        })
      } else {
        config.value = null
        isNew.value = true
        Object.assign(form, defaultConfig())
      }
    } finally {
      loading.value = false
    }
  }

  const saveConfig = async () => {
    saving.value = true
    saveError.value = ''
    saveSuccess.value = ''

    try {
      const body = {
        projectName: form.projectName,
        mcVersion: form.mcVersion,
        modLoader: form.modLoader,
        loaderVersion: form.loaderVersion,
        minMemory: form.minMemory,
        maxMemory: form.maxMemory,
        online: form.online,
        jvmArgs: form.jvmArgs.split(/\s+/).filter(Boolean),
      }

      if (isNew.value) {
        await post('/launcher/config', body)
        saveSuccess.value = 'Конфиг создан'
        isNew.value = false
        config.value = body
      } else {
        await patch('/admin/config', body)
        saveSuccess.value = 'Конфиг обновлён'
      }
    } catch (e: any) {
      saveError.value = e?.data?.errorMessage || e?.message || 'Ошибка сохранения'
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
