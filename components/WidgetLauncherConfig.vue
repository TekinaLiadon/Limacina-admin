<template>
  <div class="card">
    <h2 class="widget-title">Конфиг лаунчера</h2>
    <div v-if="config">
      <div class="config-edit-grid">
        <div class="form-group">
          <label for="config-project">Проект</label>
          <input id="config-project" v-model="form.projectName" type="text" class="input" />
        </div>
        <div class="form-group">
          <label for="config-mc-version">Версия MC</label>
          <input id="config-mc-version" v-model="form.mcVersion" type="text" class="input" />
        </div>
        <div class="form-group">
          <label for="config-mod-loader">Загрузчик модов</label>
          <input id="config-mod-loader" v-model="form.modLoader" type="text" class="input" />
        </div>
        <div class="form-group">
          <label for="config-loader-version">Версия загрузчика</label>
          <input id="config-loader-version" v-model="form.loaderVersion" type="text" class="input" />
        </div>
        <div class="form-group">
          <label for="config-min-memory">Мин. память</label>
          <input id="config-min-memory" v-model="form.minMemory" type="text" class="input" placeholder="2G" />
        </div>
        <div class="form-group">
          <label for="config-max-memory">Макс. память</label>
          <input id="config-max-memory" v-model="form.maxMemory" type="text" class="input" placeholder="4G" />
        </div>
        <div class="form-group">
          <label for="config-online">Онлайн</label>
          <select id="config-online" v-model="form.online" class="input">
            <option :value="null">Неизвестно</option>
            <option :value="true">Да</option>
            <option :value="false">Нет</option>
          </select>
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
        <span v-else>Сохранить</span>
      </button>
    </div>
    <div v-else class="empty-state padded">
      <p>Не удалось загрузить конфиг</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LauncherConfig } from '~/composables/useLauncherConfig'

defineProps<{
  config: any
  form: LauncherConfig
  saving: boolean
  saveError: string
  saveSuccess: string
}>()

defineEmits<{
  save: []
}>()
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
