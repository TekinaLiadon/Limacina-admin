<template>
  <div class="coming-soon">
    <span class="coming-soon-badge">TBD</span>
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<style lang="scss" scoped>
.coming-soon {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 80px 4px;
}

.coming-soon-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  box-shadow: inset 0 0 0 1px rgba(129, 130, 132, 0.18);
  font-family: var(--font-mono);
  font-size: 0.625rem;
  letter-spacing: 0.064em;
  text-transform: uppercase;
  color: var(--text-muted);
}

h2 {
  font-size: 1.5625rem;
  color: var(--text-bright);
}

p {
  color: var(--text-muted);
  font-size: 0.875rem;
  line-height: 1.45;
}
</style>
