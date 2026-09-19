<template>
  <div class="card">
    <div class="rcon-head">
      <h2 class="widget-title">RCON-консоль</h2>
      <AppButton
        v-if="journal.length > 0"
        variant="ghost"
        size="sm"
        @click="$emit('clearJournal')"
      >
        Очистить журнал
      </AppButton>
    </div>

    <AppSpinner v-if="statusLoading" />
    <template v-else>
      <AppAlert v-if="statusError" :message="statusError" type="error" />

      <p v-else-if="enabled === false" class="rcon-disabled">RCON не включён</p>

      <template v-else-if="enabled">
        <form class="rcon-form" @submit.prevent="$emit('execute')">
          <div class="rcon-field">
            <span class="rcon-slash">/</span>
            <input
              :value="command"
              type="text"
              class="rcon-input"
              placeholder="list"
              autocomplete="off"
              spellcheck="false"
              @input="$emit('update:command', ($event.target as HTMLInputElement).value)"
            >
          </div>
          <AppButton type="submit" variant="primary" :loading="executing" :disabled="!commandValid">
            Выполнить
          </AppButton>
        </form>

        <ul v-if="hints.length > 0" class="rcon-hints">
          <li v-for="hint in hints" :key="hint">
            <button type="button" class="rcon-hint" @click="$emit('selectHint', hint)">
              {{ hint }}
            </button>
          </li>
        </ul>

        <AppAlert v-if="executeError" :message="executeError" type="error" />

        <div v-if="journal.length > 0" ref="journalEl" class="rcon-journal">
          <div v-for="(entry, index) in journal" :key="index" class="rcon-entry">
            <div class="rcon-echo">/{{ entry.command }}</div>
            <div v-if="isRconOutputEmpty(entry.output)" class="rcon-output-empty">пустой ответ</div>
            <div v-else class="rcon-output">{{ entry.output }}</div>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  filterRconCommandHints, isRconOutputEmpty, normalizeRconCommand,
  type RconJournalEntry,
} from '~/utils/rconHelpers'

const props = defineProps<{
  statusLoading: boolean
  statusError: string
  enabled: boolean | null
  commands: string[]
  command: string
  executing: boolean
  executeError: string
  journal: RconJournalEntry[]
}>()

defineEmits<{
  execute: []
  clearJournal: []
  selectHint: [command: string]
  'update:command': [value: string]
}>()

const hints = computed(() => filterRconCommandHints(props.commands, props.command))
const commandValid = computed(() => normalizeRconCommand(props.command).length > 0)

const journalEl = ref<HTMLElement | null>(null)

watch(
  () => props.journal.length,
  async () => {
    await nextTick()
    const el = journalEl.value
    if (el) el.scrollTop = el.scrollHeight
  },
)
</script>

<style lang="scss" scoped>
@use '~/assets/css/mixins' as *;

.rcon-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;

  .widget-title {
    margin-bottom: 0;
  }
}

.rcon-disabled {
  margin: 0;
  color: var(--text-muted);
}

.rcon-form {
  display: flex;
  align-items: stretch;
  gap: 8px;

  @include mobile {
    flex-direction: column;
  }
}

.rcon-field {
  flex: 1;
  display: flex;
  align-items: center;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  transition: border-color 0.15s;

  &:focus-within {
    border-color: var(--primary);
  }
}

.rcon-slash {
  padding: 8px 4px 8px 12px;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--text-faint);
  user-select: none;
}

.rcon-input {
  flex: 1;
  min-width: 0;
  padding: 8px 12px 8px 4px;
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--text);
}

.rcon-hints {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.rcon-hint {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.053em;
  text-transform: uppercase;
  color: var(--text);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 4px 10px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;

  &:hover {
    border-color: var(--primary);
    color: var(--primary);
  }
}

.rcon-journal {
  margin-top: 16px;
  max-height: 320px;
  overflow-y: auto;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 12px;
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  line-height: 1.5;
}

.rcon-entry {
  padding: 6px 0;
  border-bottom: 1px solid var(--border);

  &:last-child {
    border-bottom: none;
  }
}

.rcon-echo {
  color: var(--text-muted);
  margin-bottom: 2px;
}

.rcon-output {
  color: var(--text);
  white-space: pre-wrap;
  word-break: break-word;
}

.rcon-output-empty {
  color: var(--text-faint);
  font-style: italic;
}

.alert {
  margin-top: 16px;
  margin-bottom: 0;
}
</style>
