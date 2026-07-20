<template>
  <div>
    <AppSpinner v-if="isLoading" />
    <AppAlert v-else-if="error" :message="error" type="error" />

    <template v-else>
      <WidgetVersionInfo
        :version="version"
        :get-download-url="getDownloadUrl"
        :capitalize="capitalize"
      />

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
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const {
  version, loading: versionLoading, error, fetchVersion, getDownloadUrl, capitalize,
} = useLauncherVersion()

const {
  config, isNew, form: configForm, loading: configLoading, saving, saveError, saveSuccess,
  fetchConfig, saveConfig,
} = useLauncherConfig()

const {
  form: uploadForm, uploading, uploadError, uploadSuccess,
  uploadLauncher,
} = useLauncherUpload()

const isLoading = computed(() => versionLoading.value || configLoading.value)

const handleUpload = () => {
  uploadLauncher((v) => { version.value = v })
}

onMounted(async () => {
  await Promise.all([fetchVersion(), fetchConfig()])
})
</script>
