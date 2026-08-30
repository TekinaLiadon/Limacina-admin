<template>
  <div class="card">
    <h2 class="widget-title">Обновить лаунчер</h2>

    <AppAlert v-if="uploadError" :message="uploadError" type="error" />
    <AppAlert v-if="uploadSuccess" :message="uploadSuccess" type="success" />

    <form class="upload-form" @submit.prevent="$emit('upload')">
      <div class="form-group">
        <label for="version-input">Версия</label>
        <input
          id="version-input"
          v-model="form.version"
          type="text"
          class="input"
          placeholder="1.0.0"
          required
          pattern="\d+\.\d+\.\d+"
        />
      </div>

      <div class="upload-platforms">
        <PlatformUploadCard
          os="Linux"
          arch="x86_64"
          v-model="form.linuxX86"
        />
        <PlatformUploadCard
          os="Linux"
          arch="aarch64"
          v-model="form.linuxArm"
        />
        <PlatformUploadCard
          os="Windows"
          arch="x86_64"
          v-model="form.windowsX86"
        />
      </div>

      <AppButton
        type="submit"
        variant="primary"
        :loading="uploading"
        :disabled="!form.version"
      >
        Обновить
      </AppButton>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { LauncherUploadForm } from '~/composables/useLauncherUpload'

defineProps<{
  form: LauncherUploadForm
  uploading: boolean
  uploadError: string
  uploadSuccess: string
}>()

defineEmits<{
  upload: []
}>()
</script>

<style lang="scss" scoped>
@use '~/assets/css/mixins' as *;

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 640px;
}

.upload-platforms {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;

  @include mobile {
    grid-template-columns: 1fr;
  }
}
</style>
