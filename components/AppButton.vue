<template>
  <button
    :type="type"
    class="btn"
    :class="[
      variant ? `btn-${variant}` : undefined,
      size ? `btn-${size}` : undefined,
    ]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="spinner"></span>
    <slot v-else />
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset'
    variant?: 'primary' | 'danger' | 'success' | 'ghost'
    size?: 'sm'
    loading?: boolean
    disabled?: boolean
  }>(),
  { type: 'button' },
)
</script>
