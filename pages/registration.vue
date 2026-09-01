<template>
  <AuthForm
    title="Регистрация"
    submit-label="Создать владельца"
    :error="error"
    :success="success"
    :pending="pending"
    @submit="handleRegister"
  />
</template>

<script setup lang="ts">
import { fetchErrorMessage } from '~/api/errors'

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
  } catch (e) {
    error.value = fetchErrorMessage(e) || 'Ошибка регистрации'
  } finally {
    pending.value = false
  }
}
</script>
