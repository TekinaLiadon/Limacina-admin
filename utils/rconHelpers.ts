export interface RconJournalEntry {
  command: string
  output: string
}

export const normalizeRconCommand = (raw: string): string =>
  raw.trim().replace(/^\/+/u, '').trim()

export const filterRconCommandHints = (commands: string[], rawInput: string): string[] => {
  const prefix = normalizeRconCommand(rawInput).toLowerCase()
  if (!prefix) return []
  return commands.filter((command) => command.toLowerCase().startsWith(prefix))
}

export const isRconOutputEmpty = (output: string): boolean => output.trim() === ''
