<template>
  <div class="card">
    <h2 class="widget-title">Опубликовать релиз</h2>

    <AppAlert v-if="publishError" :message="publishError" type="error" />
    <AppAlert v-if="publishSuccess" :message="publishSuccess" type="success" />

    <form class="release-form" @submit.prevent="$emit('publish')">
      <div class="form-group">
        <label for="release-version">Версия</label>
        <input
          id="release-version"
          v-model="form.version"
          type="text"
          class="input"
          placeholder="1.0.0"
          required
          pattern="\d+\.\d+\.\d+"
        />
      </div>

      <p class="form-hint">У каждого артефакта своя подпись .sig — tauri build на CI кладёт её рядом с файлом (ключ подписи один, подписей по числу артефактов)</p>
      <p class="form-hint">Публикация инкрементальная — можно догружать платформы по одной; повторная публикация заменяет файлы версии</p>

      <div class="release-platforms">
        <div v-for="platform in UPDATER_PLATFORMS" :key="platform.key" class="release-platform">
          <div class="release-platform-header">
            <span class="platform-name">{{ platform.os }} {{ platform.arch }}</span>
            <span class="platform-key">{{ platform.key }}{{ platform.artifactExt }}</span>
          </div>
          <div class="release-platform-pairs">
            <PlatformUploadCard
              title="Артефакт"
              :ext="platform.artifactExt"
              :accept="platform.artifactExt"
              v-model="form.pairs[platform.key].artifact"
            />
            <PlatformUploadCard
              title="Подпись"
              ext=".sig"
              accept=".sig"
              v-model="form.pairs[platform.key].signature"
            />
          </div>
        </div>
      </div>

      <p v-if="formError" class="form-hint">{{ formError }}</p>

      <AppButton
        type="submit"
        variant="primary"
        :loading="publishing"
        :disabled="!!formError"
      >
        Опубликовать
      </AppButton>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { ReleaseUploadForm } from '~/composables/useLauncherReleasePublish'
import { UPDATER_PLATFORMS } from '~/utils/updaterPlatforms'

defineProps<{
  form: ReleaseUploadForm
  formError: string
  publishing: boolean
  publishError: string
  publishSuccess: string
}>()

defineEmits<{
  publish: []
}>()
</script>

<style lang="scss" scoped>
@use '~/assets/css/mixins' as *;

.release-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  max-width: 320px;
}

.form-hint {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.053em;
  color: var(--text-faint);
  line-height: 1.5;
}

.release-platforms {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;

  @include mobile {
    grid-template-columns: 1fr;
  }
}

.release-platform {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg);
}

.release-platform-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.platform-name {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.058em;
  text-transform: uppercase;
  color: var(--text);
}

.platform-key {
  font-family: var(--font-mono);
  font-size: 0.625rem;
  color: var(--text-faint);
  word-break: break-all;
  text-align: right;
}

.release-platform-pairs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  @include mobile {
    grid-template-columns: 1fr;
  }
}
</style>
