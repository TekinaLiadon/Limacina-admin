import { ApiEndpoint } from '~/api/endpoints'

export const useServerControl = () => {
  const { post } = useApi()

  const restarting = ref(false)
  const restartMode = ref<'restart' | 'rebuild'>('restart')
  const error = ref('')
  const restarted = ref(false)

  const restartServer = async (rebuild = false) => {
    restarting.value = true
    restartMode.value = rebuild ? 'rebuild' : 'restart'
    error.value = ''
    restarted.value = false

    try {
      const { error: err } = await post(ApiEndpoint.ServerRestart, { rebuild })

      if (err.value) {
        error.value = err.value
      } else {
        restarted.value = true
      }
    } finally {
      restarting.value = false
    }
  }

  return { restarting, restartMode, error, restarted, restartServer }
}
