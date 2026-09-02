<template>
  <div v-if="open" class="sidebar-overlay" @click="$emit('close')"></div>
  <aside class="sidebar" :class="{ open }">
    <div class="sidebar-brand">
      <img src="/icon.svg" alt="Limacina" class="brand-icon" />
      <span class="brand-text">Limacina</span>
    </div>

    <nav class="sidebar-nav">
      <NuxtLink
        v-for="item in visibleNavItems"
        :key="item.path"
        :to="item.disabled ? undefined : item.path"
        class="nav-item"
        :class="{ active: route.path === item.path, disabled: item.disabled }"
        @click="$emit('close')"
      >
        <span>{{ item.label }}</span>
      </NuxtLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { navItems } from '~/utils/nav'
import { ROLE_COOKIE } from '~/utils/authCookies'

defineProps<{
  open: boolean
}>()

defineEmits<{
  close: []
}>()

const route = useRoute()
const role = useCookie(ROLE_COOKIE)

const visibleNavItems = computed(() =>
  navItems.filter((item) => !item.ownerOnly || role.value === 'owner'))
</script>

<style lang="scss" scoped>
@use '~/assets/css/mixins' as *;

.sidebar-overlay {
  display: none;

  @include mobile {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(11, 14, 18, 0.7);
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
  width: 28px;
  height: 28px;
}

.brand-text {
  font-size: 0.9375rem;
  letter-spacing: 0.01em;
  color: var(--text-bright);
}

.sidebar-nav {
  padding: 12px 0;
  display: flex;
  flex-direction: column;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 9px 20px;
  border-left: 1px solid transparent;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.058em;
  text-transform: uppercase;
  transition: color 0.15s, border-color 0.15s, background 0.15s;

  &:hover:not(.disabled) {
    color: var(--text-bright);
    background: var(--bg-hover);
  }

  &.disabled {
    opacity: 0.35;
    cursor: not-allowed;
    pointer-events: none;
  }

  &.active {
    border-left-color: var(--primary);
    color: var(--primary);
    background: var(--bg-hover);
  }
}
</style>
