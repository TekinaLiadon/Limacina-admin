import { ApiEndpoint } from '~/api/endpoints'

export const useServerControl = () => {
  const { post } = useApi()

  const restarting = ref(false)
  const error = ref('')
  const restarted = ref(false)

  const restartServer = async () => {
    restarting.value = true
    error.value = ''
    restarted.value = false

    try {
      const { error: err } = await post(ApiEndpoint.ServerRestart)

      if (err.value) {
        error.value = err.value
      } else {
        restarted.value = true
      }
    } finally {
      restarting.value = false
    }
  }

  return { restarting, error, restarted, restartServer }
}
