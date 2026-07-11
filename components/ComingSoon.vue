<template>
  <div class="coming-soon">
    <div class="coming-soon-icon">{{ icon }}</div>
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
  icon?: string
}>()
</script>

<style scoped>
.coming-soon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
}

.coming-soon-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 8px;
}

p {
  color: var(--text-muted);
  font-size: 0.875rem;
}
</style>
