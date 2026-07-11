<template>
  <div class="login-card">
    <div class="login-brand">
      <img src="/icon.svg" alt="Limacina" class="brand-icon" />
      <h1>{{ title }}</h1>
    </div>

    <form @submit.prevent="onSubmit">
      <AppAlert v-if="error" :message="error" type="error" />
      <AppAlert v-if="success" :message="success" type="success" />

      <div class="form-group">
        <label for="auth-username">Имя пользователя</label>
        <input
          id="auth-username"
          v-model="username"
          type="text"
          class="input"
          placeholder="username"
          required
          autofocus
        />
      </div>

      <div class="form-group">
        <label for="auth-password">Пароль</label>
        <input
          id="auth-password"
          v-model="password"
          type="password"
          class="input"
          placeholder="password"
          required
        />
      </div>

      <button type="submit" class="btn btn-primary login-btn" :disabled="pending">
        <span v-if="pending" class="spinner"></span>
        <span v-else>{{ submitLabel }}</span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  submitLabel: string
  error?: string
  success?: string
  pending?: boolean
}>()

const emit = defineEmits<{
  submit: [username: string, password: string]
}>()

const username = ref('')
const password = ref('')

const onSubmit = () => {
  emit('submit', username.value, password.value)
}
</script>

<style lang="scss" scoped>
@use '~/assets/css/mixins' as *;

.login-card {
  width: 100%;
  max-width: 380px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 32px;

  @include mobile {
    padding: 24px;
  }
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}

.brand-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
}

h1 {
  font-size: 1.25rem;
  font-weight: 600;
}

form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login-btn {
  width: 100%;
  justify-content: center;
  padding: 12px;
  margin-top: 8px;
}
</style>
