<template>
  <div>
    <AppDataState :loading="isLoading" :error="pageError">
      <WidgetVersionInfo :version="version" />

      <WidgetLauncherUpload
        :form="uploadForm"
        :uploading="uploading"
        :upload-error="uploadError"
        :upload-success="uploadSuccess"
        @upload="handleUpload"
      />

      <WidgetLauncherConfig
        :config="config"
        :is-new="isNew"
        :form="configForm"
        :saving="saving"
        :save-error="saveError"
        :save-success="saveSuccess"
        @save="saveConfig"
      />
    </AppDataState>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const {
  version, loading: versionLoading, error: versionError, fetchVersion,
} = useLauncherVersion()

const {
  config, isNew, form: configForm, loading: configLoading, error: configError,
  saving, saveError, saveSuccess, fetchConfig, saveConfig,
} = useLauncherConfig()

const {
  form: uploadForm, uploading, uploadError, uploadSuccess,
  uploadLauncher,
} = useLauncherUpload()

const isLoading = computed(() => versionLoading.value || configLoading.value)
const pageError = computed(() => versionError.value || configError.value)

const handleUpload = () => {
  uploadLauncher((v) => { version.value = v })
}

onMounted(async () => {
  await Promise.all([fetchVersion(), fetchConfig()])
})
</script>
