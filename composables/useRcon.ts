import { ApiEndpoint } from '~/api/endpoints'
import {
  API_FORMAT_ERROR, isRconCommands, isRconOutput, isRconStatus,
  type RconCommands, type RconOutput, type RconStatus,
} from '~/api/types'
import { normalizeRconCommand, type RconJournalEntry } from '~/utils/rconHelpers'

const STATUS_TTL_MS = 5 * 60 * 1000

interface StatusCache {
  enabled: boolean
  expiresAt: number
}

let statusCache: StatusCache | null = null

interface RconState {
  statusLoading: Ref<boolean>
  statusError: Ref<string>
  enabled: Ref<boolean | null>
  commands: Ref<string[]>
  command: Ref<string>
  executing: Ref<boolean>
  executeError: Ref<string>
  journal: Ref<RconJournalEntry[]>
  fetchStatus: () => Promise<void>
  execute: () => Promise<void>
  clearJournal: () => void
}

export const useRcon = (): RconState => {
  const { get, post } = useApi()

  const statusLoading = ref(true)
  const statusError = ref('')
  const enabled = ref<boolean | null>(null)
  const commands = ref<string[]>([])
  const command = ref('')
  const executing = ref(false)
  const executeError = ref('')
  const journal = ref<RconJournalEntry[]>([])

  const fetchCommands = async (): Promise<void> => {
    const { data, error: err } = await get<RconCommands>(ApiEndpoint.ServerRconCommands)
    if (!err.value && isRconCommands(data.value)) {
      commands.value = data.value.commands
    }
  }

  const fetchStatus = async (): Promise<void> => {
    if (statusCache && statusCache.expiresAt > Date.now()) {
      enabled.value = statusCache.enabled
      if (statusCache.enabled && commands.value.length === 0) await fetchCommands()
      return
    }

    statusLoading.value = true
    statusError.value = ''

    try {
      const { data, error: err } = await get<RconStatus>(ApiEndpoint.ServerRconStatus)

      if (err.value) {
        statusError.value = err.value
        return
      }
      if (!isRconStatus(data.value)) {
        statusError.value = API_FORMAT_ERROR
        return
      }

      statusCache = { enabled: data.value.enabled, expiresAt: Date.now() + STATUS_TTL_MS }
      enabled.value = data.value.enabled
      if (data.value.enabled) await fetchCommands()
    } finally {
      statusLoading.value = false
    }
  }

  const execute = async (): Promise<void> => {
    const body = normalizeRconCommand(command.value)
    if (!body || executing.value) return

    executing.value = true
    executeError.value = ''

    try {
      const { data, error: err } = await post<RconOutput>(ApiEndpoint.ServerRconExecute, { command: body })

      if (err.value) {
        executeError.value = err.value
        return
      }
      if (!isRconOutput(data.value)) {
        executeError.value = API_FORMAT_ERROR
        return
      }

      journal.value = [...journal.value, { command: body, output: data.value.output }]
      command.value = ''
    } finally {
      executing.value = false
    }
  }

  const clearJournal = (): void => {
    journal.value = []
  }

  return {
    statusLoading, statusError, enabled, commands, command,
    executing, executeError, journal,
    fetchStatus, execute, clearJournal,
  }
}
