<template>
  <div v-if="open" class="sidebar-overlay" @click="$emit('close')"></div>
  <aside class="sidebar" :class="{ open }">
    <div class="sidebar-brand">
      <img src="/icon.svg" alt="Limacina" class="brand-icon" />
      <span class="brand-text">Limacina</span>
    </div>

    <nav class="sidebar-nav">
      <NuxtLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.disabled ? undefined : item.path"
        class="nav-item"
        :class="{ active: route.path === item.path, disabled: item.disabled }"
        @click="$emit('close')"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </NuxtLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
}>()

defineEmits<{
  close: []
}>()

const route = useRoute()
</script>

<style lang="scss" scoped>
@use '~/assets/css/mixins' as *;

.sidebar-overlay {
  display: none;

  @include mobile {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9;
  }
}

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--sidebar-width);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  z-index: 10;

  @include mobile {
    transform: translateX(-100%);
    transition: transform 0.25s ease;

    &.open {
      transform: translateX(0);
    }
  }
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.brand-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
}

.brand-text {
  font-size: 0.9375rem;
  font-weight: 600;
}

.sidebar-nav {
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-size: 0.875rem;
  transition: all 0.15s;

  &:hover:not(.disabled) {
    background: var(--bg-hover);
    color: var(--text);
  }

  &.disabled {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;
  }

  &.active {
    background: var(--primary);
    color: white;
  }
}

.nav-icon {
  font-size: 1rem;
}
</style>
