<template>
  <header class="header">
    <div class="header-left">
      <button class="btn btn-ghost btn-sm hamburger" @click="$emit('toggleSidebar')">
        ☰
      </button>
      <h1 class="header-title">{{ pageTitle }}</h1>
    </div>
    <button class="btn btn-ghost" @click="logout">Выйти</button>
  </header>
</template>

<script setup lang="ts">
const route = useRoute()
const token = useCookie('auth_token')

defineEmits<{
  toggleSidebar: []
}>()

const pageTitle = computed(() => navTitles[route.path] || 'Admin')

const logout = async () => {
  token.value = null
  navigateTo('/login')
}
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
  font-weight: 600;

  @include mobile {
    font-size: 1rem;
  }

  @include ultrawide {
  font-size: 1.25rem;
  }
}
</style>
