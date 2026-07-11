<template>
  <div :class="['alert', type === 'error' ? 'alert-error' : 'alert-success']">
    {{ message }}
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string
  type?: 'error' | 'success'
}>()
</script>
