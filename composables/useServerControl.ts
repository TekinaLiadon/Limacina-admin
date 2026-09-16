import { ApiEndpoint } from '~/api/endpoints'
import { toFetchError } from '~/api/errors'
import type { RebuildStatus } from '~/api/types'

const POLL_INTERVAL_MS = 2000
const MAX_POLL_FAILURES = 3

interface ServerControlState {
  restarting: Ref<boolean>
  polling: Ref<boolean>
  restartMode: Ref<'restart' | 'rebuild'>
  error: Ref<string>
  restarted: Ref<boolean>
  rebuildStatus: Ref<RebuildStatus | null>
  restartServer: (rebuild?: boolean) => Promise<void>
}

export const useServerControl = (): ServerControlState => {
  const { post, get } = useApi()

  const restarting = ref(false)
  const polling = ref(false)
  const restartMode = ref<'restart' | 'rebuild'>('restart')
  const error = ref('')
  const restarted = ref(false)
  const rebuildStatus = ref<RebuildStatus | null>(null)

  let pollTimer: ReturnType<typeof setTimeout> | undefined = undefined
  let pollFailures = 0

  const stopPolling = (): void => {
    clearTimeout(pollTimer)
    polling.value = false
  }

  onScopeDispose(stopPolling)

  const pollRebuild = async (): Promise<void> => {
    const { data, error: err, cause } = await get<RebuildStatus>(ApiEndpoint.ServerRebuildStatus)

    if (err.value) {
      pollFailures += 1
      if (toFetchError(cause.value).statusCode) {
        error.value = err.value
        stopPolling()
        return
      }
      if (pollFailures >= MAX_POLL_FAILURES) {
        restarted.value = true
        stopPolling()
        return
      }
    } else if (data.value) {
      rebuildStatus.value = data.value
      pollFailures = 0
      if (!data.value.inProgress) {
        if (data.value.lastError) {
          error.value = data.value.lastError
        } else {
          restarted.value = true
        }
        stopPolling()
        return
      }
    }

    pollTimer = setTimeout(pollRebuild, POLL_INTERVAL_MS)
  }

  const startPolling = (): void => {
    clearTimeout(pollTimer)
    pollFailures = 0
    rebuildStatus.value = null
    polling.value = true
    pollTimer = setTimeout(pollRebuild, POLL_INTERVAL_MS)
  }

  const restartServer = async (rebuild = false): Promise<void> => {
    stopPolling()
    restarting.value = true
    restartMode.value = rebuild ? 'rebuild' : 'restart'
    error.value = ''
    restarted.value = false
    rebuildStatus.value = null

    try {
      const { error: err, cause } = await post(ApiEndpoint.ServerRestart, { rebuild })

      if (err.value) {
        if (rebuild && toFetchError(cause.value).statusCode === 409) {
          startPolling()
        } else {
          error.value = err.value
        }
      } else if (rebuild) {
        startPolling()
      } else {
        restarted.value = true
      }
    } finally {
      restarting.value = false
    }
  }

  return { restarting, polling, restartMode, error, restarted, rebuildStatus, restartServer }
}
