<template>
  <div>
    <p class="text-muted">Выберите раздел в боковой панели.</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})
</script>

<style lang="scss" scoped>
.text-muted {
  color: var(--text-muted);
}
</style>
