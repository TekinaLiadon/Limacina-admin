<template>
  <div class="admin-layout">
    <AppSidebar :open="sidebarOpen" @close="sidebarOpen = false" />
    <div class="admin-main">
      <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <main class="admin-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const sidebarOpen = ref(false)
</script>

<style lang="scss" scoped>
@use '~/assets/css/mixins' as *;

.admin-layout {
  display: flex;
  min-height: 100vh;
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: var(--sidebar-width);

  @include mobile {
    margin-left: 0;
  }
}

.admin-content {
  flex: 1;
  padding: 32px;

  @include mobile {
    padding: 16px;
  }

  @include ultrawide {
    padding: 40px 64px;
  }
}
</style>
