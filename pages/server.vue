<template>
  <div>
    <div class="card">
      <h2 class="widget-title">Перезапуск сервера</h2>
      <AppButton variant="danger" :loading="restarting" @click="showConfirm = true">
        Перезапустить сервер
      </AppButton>
      <AppAlert v-if="restarted" message="Команда на перезапуск отправлена — сервер вернётся через несколько секунд" type="success" />
      <AppAlert v-if="restartError" :message="restartError" type="error" />
    </div>

    <div class="card">
      <h2 class="widget-title">Смена пароля пользователя</h2>
      <div class="password-form">
        <div class="form-group">
          <label for="password-username">Имя пользователя</label>
          <input
            id="password-username"
            v-model="username"
            type="text"
            class="input"
            placeholder="john"
          >
        </div>
        <div class="form-group">
          <label for="password-value">Новый пароль</label>
          <input
            id="password-value"
            v-model="password"
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

    <AppConfirm
      v-model="showConfirm"
      message="Вы уверены что хотите перезапустить сервер?"
      @confirm="restartServer"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'owner',
})

const { restarting, error: restartError, restarted, restartServer } = useServerControl()
const { username, password, saving, error, changed, valid, submit } = useUserPassword()

const showConfirm = ref(false)
</script>

<style lang="scss" scoped>
@use '~/assets/css/mixins' as *;

.password-form {
  display: flex;
  align-items: flex-end;
  gap: 16px;

  .form-group {
    flex: 1;
    max-width: 280px;
  }

  @include mobile {
    flex-direction: column;
    align-items: stretch;

    .form-group {
      max-width: none;
    }
  }
}

.alert {
  margin-top: 16px;
  margin-bottom: 0;
}
</style>
