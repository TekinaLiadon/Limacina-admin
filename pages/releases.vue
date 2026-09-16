<template>
  <div>
    <AppDataState :loading="isLoading" :error="pageError">
      <WidgetVersionInfo :latest="latest" />

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
        :loading="historyLoading"
        :error="historyError"
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
})

const {
  latest, loading: latestLoading, error: latestError, fetchLatest,
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

const isLoading = computed(() => latestLoading.value || historyLoading.value || configLoading.value)
const pageError = computed(() => latestError.value || historyError.value || configError.value)

const handlePublish = (): void => {
  publishRelease(() => {
    fetchLatest(true)
    fetchReleases(true)
  })
}

onMounted(async () => {
  await Promise.all([fetchLatest(), fetchReleases(), fetchConfig()])
})
</script>
