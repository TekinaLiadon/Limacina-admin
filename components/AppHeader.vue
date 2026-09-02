<template>
  <header class="header">
    <div class="header-left">
      <AppButton variant="ghost" size="sm" class="hamburger" @click="$emit('toggleSidebar')">
        ☰
      </AppButton>
      <h1 class="header-title">{{ pageTitle }}</h1>
    </div>
    <div class="header-right">
      <span v-if="username" class="user-name">{{ username }}</span>
      <AppButton variant="ghost" @click="logout">Выйти</AppButton>
    </div>
  </header>
</template>

<script setup lang="ts">
import { navTitles } from '~/utils/nav'
import { USER_NAME_COOKIE } from '~/utils/authCookies'

const route = useRoute()
const { logout } = useAuth()

defineEmits<{
  toggleSidebar: []
}>()

const pageTitle = computed(() => navTitles[route.path] || 'Admin')
const username = useCookie(USER_NAME_COOKIE)
</script>

<style lang="scss" scoped>
@use '~/assets/css/mixins' as *;

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-secondary);

  @include mobile {
    padding: 12px 16px;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.user-name {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  background: var(--bg);
  box-shadow: inset 0 0 0 1px var(--border);
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.058em;
  text-transform: uppercase;
  color: var(--text-bright);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.hamburger {
  display: none;
  font-size: 1.25rem;

  @include mobile {
    display: inline-flex;
  }
}

.header-title {
  font-size: 1.125rem;
  font-weight: 400;
  color: var(--text-bright);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @include mobile {
    font-size: 1rem;
  }

  @include ultrawide {
  font-size: 1.25rem;
  }
}
</style>
