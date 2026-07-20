<template>
  <div class="card">
    <h2 class="widget-title">Конфиг лаунчера</h2>
    <div>
      <div class="config-edit-grid">
        <div v-for="field in fields" :key="field.key" class="form-group">
          <label :for="`config-${field.key}`">{{ field.label }}</label>
          <select
            v-if="field.type === 'select'"
            :id="`config-${field.key}`"
            v-model="form[field.key]"
            class="input"
          >
            <option :value="null">Неизвестно</option>
            <option :value="true">Да</option>
            <option :value="false">Нет</option>
          </select>
          <input
            v-else
            :id="`config-${field.key}`"
            v-model="form[field.key]"
            type="text"
            class="input"
            :placeholder="field.placeholder ?? ''"
          />
        </div>
      </div>
      <div class="form-group jvm-args">
        <label for="config-jvm-args">JVM аргументы</label>
        <input id="config-jvm-args" v-model="form.jvmArgs" type="text" class="input" placeholder="-Xmx4G -Xms2G" />
      </div>
      <AppAlert v-if="saveSuccess" :message="saveSuccess" type="success" />
      <AppAlert v-if="saveError" :message="saveError" type="error" />
      <button type="button" class="btn btn-primary" :disabled="saving" @click="$emit('save')">
        <span v-if="saving" class="spinner"></span>
        <span v-else>{{ isNew ? 'Создать конфиг' : 'Сохранить' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LauncherConfig } from '~/composables/useLauncherConfig'

defineProps<{
  config: any
  isNew: boolean
  form: LauncherConfig
  saving: boolean
  saveError: string
  saveSuccess: string
}>()

defineEmits<{
  save: []
}>()

type FieldKey = keyof Omit<LauncherConfig, 'jvmArgs'>

const fields: { key: FieldKey; label: string; placeholder?: string; type?: 'select' }[] = [
  { key: 'projectName', label: 'Проект' },
  { key: 'mcVersion', label: 'Версия MC' },
  { key: 'modLoader', label: 'Загрузчик модов' },
  { key: 'loaderVersion', label: 'Версия загрузчика' },
  { key: 'minMemory', label: 'Мин. память', placeholder: '2G' },
  { key: 'maxMemory', label: 'Макс. память', placeholder: '4G' },
  { key: 'online', label: 'Онлайн', type: 'select' },
]
</script>

<style lang="scss" scoped>
@use '~/assets/css/mixins' as *;

.widget-title {
  font-size: 1rem;
  margin-bottom: 16px;
}

.config-edit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;

  @include mobile {
    grid-template-columns: 1fr;
  }
}

.jvm-args {
  margin-bottom: 16px;
}

.padded {
  padding: 24px;
}
</style>
