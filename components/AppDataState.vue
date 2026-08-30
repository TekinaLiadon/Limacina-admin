<template>
  <AppSpinner v-if="loading" />
  <AppAlert v-else-if="error" :message="error" type="error" />

  <div v-else-if="empty" class="card empty-state">
    <p>{{ emptyText }}</p>
  </div>

  <slot v-else />
</template>

<script setup lang="ts">
defineProps<{
  loading: boolean
  error: string
  empty?: boolean
  emptyText?: string
}>()
</script>
