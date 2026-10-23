<template>
  <details class="card mods-card">
    <summary class="mods-summary">
      <span class="widget-title">Моды лаунчера</span>
    </summary>

    <div class="mods-upload">
      <label class="file-pick">
        <input type="file" accept=".jar" multiple hidden @change="onFilesChange">
        Выбрать .jar
      </label>
      <span class="file-hint">{{ filesLabel }}</span>
      <AppButton
        variant="primary"
        :loading="uploading"
        :disabled="files.length === 0"
        @click="$emit('upload', files)"
      >
        Загрузить
      </AppButton>
    </div>

    <AppAlert v-if="uploadError" :message="uploadError" type="error" />
    <AppAlert v-if="uploadSuccess" :message="uploadSuccess" type="success" />
    <AppAlert v-if="deleteError" :message="deleteError" type="error" />

    <AppDataState :loading="loading" :error="error" :empty="!mods.length" empty-text="В папке модов пусто">
      <ul class="mods-list">
        <li v-for="mod in mods" :key="mod.name" class="mod-row">
          <span class="mod-name">{{ mod.name }}</span>
          <span class="mod-size">{{ formatBytes(mod.size) }}</span>
          <AppButton
            variant="danger"
            size="sm"
            :loading="deleting === mod.name"
            :disabled="deleting !== ''"
            @click="askDelete(mod.name)"
          >
            Удалить
          </AppButton>
        </li>
      </ul>
    </AppDataState>

    <AppConfirm
      v-model="confirmOpen"
      :message="`Удалить мод ${pendingDelete}?`"
      @confirm="confirmDelete"
    />
  </details>
</template>

<script setup lang="ts">
import type { ModFile } from '~/api/types'
import { formatBytes } from '~/utils/format'

const props = defineProps<{
  mods: ModFile[]
  loading: boolean
  error: string
  uploading: boolean
  uploadError: string
  uploadSuccess: string
  deleting: string
  deleteError: string
}>()

const emit = defineEmits<{
  upload: [files: File[]]
  delete: [name: string]
}>()

const files = ref<File[]>([])
const filesLabel = computed(() => files.value.length > 0
  ? files.value.map((file) => file.name).join(', ')
  : 'Файлы не выбраны')

const confirmOpen = ref(false)
const pendingDelete = ref('')

const onFilesChange = (event: Event): void => {
  const input = event.target as HTMLInputElement
  files.value = [...(input.files ?? [])]
  input.value = ''
}

watch(() => props.uploadSuccess, () => {
  files.value = []
})

const askDelete = (name: string): void => {
  pendingDelete.value = name
  confirmOpen.value = true
}

const confirmDelete = (): void => {
  emit('delete', pendingDelete.value)
}
</script>

<style lang="scss" scoped>
@use '~/assets/css/mixins' as *;

.mods-card {
  margin-top: 24px;
}

.mods-card[open] .mods-summary {
  margin-bottom: 16px;
}

.mods-summary {
  display: flex;
  align-items: center;
  cursor: pointer;
  list-style: none;

  &::-webkit-details-marker {
    display: none;
  }

  .widget-title {
    margin-bottom: 0;
  }

  &::after {
    content: '+';
    margin-left: auto;
    font-family: var(--font-mono);
    font-size: 0.875rem;
    color: var(--text-muted);
  }

  .mods-card[open] &::after {
    content: '−';
  }
}

.mods-upload {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.file-pick {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  background: var(--bg);
  border: 1px dashed var(--border);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.053em;
  text-transform: uppercase;
  color: var(--text-muted);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;

  &:hover {
    border-color: var(--primary);
    color: var(--primary);
  }
}

.file-hint {
  flex: 1;
  min-width: 200px;
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--text-faint);
  word-break: break-all;
}

.mods-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.mod-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);

  &:last-child {
    border-bottom: none;
  }
}

.mod-name {
  flex: 1;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text);
  word-break: break-all;
}

.mod-size {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.alert {
  margin-bottom: 16px;
}
</style>
