<template>
  <div>
    <AppDataState :loading="isLoading" :error="pageError">
      <WidgetVersionInfo
        :latest="latest"
        :preview="preview"
        :preview-version="previewVersion"
        :preview-loading="previewLoading"
        :preview-error="previewError"
        @clear-preview="clearPreview"
      />

      <WidgetReleaseUpload
        :form="publishForm"
        :form-error="formError"
        :publishing="publishing"
        :publish-error="publishError"
        :publish-success="publishSuccess"
        @publish="handlePublish"
      />

      <WidgetReleaseHistory
        :releases="releases"
        :latest-version="latest?.version ?? ''"
        :preview-version="previewVersion"
        :loading="historyLoading"
        :error="historyError"
        @select="viewVersion"
      />

      <WidgetLauncherMods
        :mods="mods"
        :loading="modsLoading"
        :error="modsError"
        :uploading="uploading"
        :upload-error="uploadError"
        :upload-success="uploadSuccess"
        :deleting="modDeleting"
        :delete-error="deleteError"
        @upload="uploadMods"
        @delete="deleteMod"
      />

      <WidgetLauncherConfig
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
  middleware: 'owner',
})

const {
  latest, preview, previewVersion,
  loading: latestLoading, error: latestError,
  previewLoading, previewError,
  fetchLatest, viewVersion, clearPreview,
} = useLauncherLatest()

const {
  releases, loading: historyLoading, error: historyError, fetchReleases,
} = useLauncherReleases()

const {
  form: publishForm, formError, publishing, publishError, publishSuccess, publishRelease,
} = useLauncherReleasePublish()

const {
  isNew, form: configForm, loading: configLoading, error: configError,
  saving, saveError, saveSuccess, fetchConfig, saveConfig,
} = useLauncherConfig()

const {
  mods, loading: modsLoading, error: modsError,
  uploading, uploadError, uploadSuccess,
  deleting: modDeleting, deleteError,
  fetchMods, uploadMods, deleteMod,
} = useLauncherMods()

const isLoading = computed(() => latestLoading.value || historyLoading.value || configLoading.value)
const pageError = computed(() => latestError.value || historyError.value || configError.value)

const handlePublish = (): void => {
  publishRelease(() => {
    fetchLatest(true)
    fetchReleases(true)
  })
}

onMounted(async () => {
  await Promise.all([fetchLatest(), fetchReleases(), fetchConfig(), fetchMods()])
})
</script>
