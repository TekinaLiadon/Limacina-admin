<template>
  <div class="card">
    <h2 class="widget-title">Смена пароля</h2>
    <div class="password-form">
      <div class="form-group">
        <label for="old-password">Текущий пароль</label>
        <input
          id="old-password"
          v-model="oldPassword"
          type="password"
          class="input"
          autocomplete="current-password"
          @keyup.enter="submit"
        >
      </div>
      <div class="form-group">
        <label for="new-password">Новый пароль</label>
        <input
          id="new-password"
          v-model="newPassword"
          type="password"
          class="input"
          placeholder="Минимум 6 символов"
          autocomplete="new-password"
          @keyup.enter="submit"
        >
      </div>
      <AppButton variant="primary" :loading="saving" :disabled="!valid" @click="submit">
        Сменить пароль
      </AppButton>
    </div>
    <AppAlert v-if="error" :message="error" type="error" />
    <AppAlert v-if="changed" message="Пароль изменён" type="success" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const { oldPassword, newPassword, saving, error, changed, valid, submit } = useChangePassword()
</script>

<style lang="scss" scoped>
.password-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 320px;
}

.alert {
  margin-top: 16px;
  margin-bottom: 0;
}
</style>
