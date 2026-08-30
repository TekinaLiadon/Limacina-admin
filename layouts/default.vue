<template>
  <div class="auth-layout">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/css/mixins' as *;

.auth-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;

  @include mobile {
    padding: 16px;
  }
}
</style>
