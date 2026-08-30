<template>
  <header class="header">
    <div class="header-left">
      <AppButton variant="ghost" size="sm" class="hamburger" @click="$emit('toggleSidebar')">
        ☰
      </AppButton>
      <h1 class="header-title">{{ pageTitle }}</h1>
    </div>
    <AppButton variant="ghost" @click="logout">Выйти</AppButton>
  </header>
</template>

<script setup lang="ts">
const route = useRoute()
const { logout } = useAuth()

defineEmits<{
  toggleSidebar: []
}>()

const pageTitle = computed(() => navTitles[route.path] || 'Admin')
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

  @include mobile {
    font-size: 1rem;
  }

  @include ultrawide {
  font-size: 1.25rem;
  }
}
</style>
