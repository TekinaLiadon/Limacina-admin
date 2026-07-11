<template>
  <div class="login-page">
    <AuthForm
      title="Регистрация"
      submit-label="Создать владельца"
      :error="error"
      :success="success"
      :pending="pending"
      @submit="handleRegister"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const { register } = useAuth()

const error = ref('')
const success = ref('')
const pending = ref(false)

const handleRegister = async (username: string, password: string) => {
  error.value = ''
  success.value = ''
  pending.value = true

  try {
    await register(username, password)
    success.value = 'Владелец создан. Через несколько секунд вы будете перенаправлены на страницу входа.'
    setTimeout(() => navigateTo('/login'), 2000)
  } catch (e: any) {
    error.value = e?.data?.errorMessage || 'Ошибка регистрации'
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
