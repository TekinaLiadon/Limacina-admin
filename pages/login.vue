<template>
  <div class="login-page">
    <AuthForm
      title="Limacina"
      submit-label="Войти"
      :error="error"
      :pending="pending"
      @submit="handleLogin"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const { login } = useAuth()

const error = ref('')
const pending = ref(false)

const handleLogin = async (username: string, password: string) => {
  error.value = ''
  pending.value = true

  try {
    await login(username, password)
  } catch (e: any) {
    error.value = e?.message || 'Неверное имя пользователя или пароль'
  } finally {
    pending.value = false
  }
}
</script>

<style lang="scss" scoped>
@use '~/assets/css/mixins' as *;

.login-page {
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
