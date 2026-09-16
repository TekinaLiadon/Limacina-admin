<template>
  <div class="platform-card" :class="{ 'has-file': modelValue !== null }">
    <div class="platform-header">
      <span class="platform-name">{{ title }}</span>
      <span class="platform-ext">{{ ext }}</span>
    </div>
    <label class="file-upload-btn" :class="{ 'has-file': modelValue !== null }">
      <input type="file" :accept="accept" hidden @change="onChange" />
      {{ modelValue ? 'Файл выбран' : 'Выберите файл' }}
    </label>
    <span class="file-name" :class="{ 'has-file': modelValue !== null }">
      {{ modelValue ? modelValue.name : 'Файл не выбран' }}
    </span>
    <span v-if="error" class="file-error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  ext: string
  accept: string
  modelValue: File | null
}>()

const emit = defineEmits<{
  'update:modelValue': [file: File | null]
}>()

const accepted = computed(() =>
  props.accept.split(',').map((part) => part.trim().toLowerCase()).filter(Boolean),
)

const error = ref('')

watch(() => props.modelValue, (value) => {
  if (value === null) error.value = ''
})

const onChange = (e: Event): void => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0] || null
  input.value = ''

  if (file && !accepted.value.some((ext) => file.name.toLowerCase().endsWith(ext))) {
    error.value = `Нужен файл: ${props.accept}`
    return
  }

  error.value = ''
  emit('update:modelValue', file)
}
</script>

<style lang="scss" scoped>
.platform-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg);
  transition: border-color 0.15s;

  &.has-file {
    border-color: rgba(0, 216, 146, 0.5);
  }
}

.platform-header {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.platform-name {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.058em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.platform-ext {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--text-faint);
}

.file-upload-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  background: var(--bg-secondary);
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

  &.has-file {
    border-style: solid;
    border-color: rgba(0, 216, 146, 0.5);
    color: var(--primary);
  }
}

.file-name {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--text-faint);
  word-break: break-all;
  line-height: 1.4;

  &.has-file {
    color: var(--text);
  }
}

.file-error {
  font-family: var(--font-mono);
  font-size: 0.625rem;
  letter-spacing: 0.053em;
  color: var(--danger);
  line-height: 1.4;
}
</style>
