<template>
  <AuthForm
    title="Limacina"
    submit-label="Войти"
    :error="error"
    :pending="pending"
    @submit="handleLogin"
  />
</template>

<script setup lang="ts">
import { fetchErrorMessage } from '~/api/errors'

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
  } catch (e) {
    error.value = fetchErrorMessage(e) || 'Неверное имя пользователя или пароль'
  } finally {
    pending.value = false
  }
}
</script>
