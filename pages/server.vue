<template>
  <div>
    <div class="card">
      <h2 class="widget-title">Перезапуск сервера</h2>
      <div class="restart-actions">
        <AppButton
          variant="danger"
          :loading="restarting && restartMode === 'restart'"
          :disabled="restarting"
          @click="askRestart(false)"
        >
          Перезапустить сервер
        </AppButton>
        <AppButton
          variant="ghost"
          :loading="restarting && restartMode === 'rebuild'"
          :disabled="restarting"
          @click="askRestart(true)"
        >
          С пересборкой
        </AppButton>
      </div>
      <AppAlert v-if="restarted" :message="restartedMessage" type="success" />
      <AppAlert v-if="restartError" :message="restartError" type="error" />
    </div>

    <div class="card">
      <h2 class="widget-title">Смена пароля пользователя</h2>
      <div class="inline-form">
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

    <div class="card">
      <h2 class="widget-title">Назначить владельца</h2>
      <div class="inline-form">
        <div class="form-group">
          <label for="owner-username">Имя пользователя</label>
          <input
            id="owner-username"
            v-model="ownerUsername"
            type="text"
            class="input"
            placeholder="john"
            @keyup.enter="askSetOwner"
          >
        </div>
        <AppButton variant="danger" :loading="granting" :disabled="!ownerValid" @click="askSetOwner">
          Назначить владельцем
        </AppButton>
      </div>
      <AppAlert v-if="ownerError" :message="ownerError" type="error" />
      <AppAlert v-if="ownerGranted" message="Пользователь назначен владельцем" type="success" />
    </div>

    <AppConfirm
      v-model="showRestartConfirm"
      :message="restartConfirmMessage"
      @confirm="restartServer(pendingRebuild)"
    />

    <AppConfirm
      v-model="showOwnerConfirm"
      :message="`Назначить пользователя ${ownerUsername} владельцем?`"
      @confirm="setOwner"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'owner',
})

const { restarting, restartMode, error: restartError, restarted, restartServer } = useServerControl()
const { username, password, saving, error, changed, valid, submit } = useUserPassword()
const {
  username: ownerUsername, granting, error: ownerError, granted: ownerGranted,
  valid: ownerValid, setOwner,
} = useSetOwner()

const showRestartConfirm = ref(false)
const pendingRebuild = ref(false)

const restartConfirmMessage = computed(() => pendingRebuild.value
  ? 'Пересобрать бинарник и перезапустить сервер? Пересборка может занять пару минут.'
  : 'Вы уверены что хотите перезапустить сервер?')

const askRestart = (rebuild: boolean) => {
  pendingRebuild.value = rebuild
  showRestartConfirm.value = true
}

const restartedMessage = computed(() =>
  restartMode.value === 'rebuild'
    ? 'Бинарник пересобран, команда на перезапуск отправлена'
    : 'Команда на перезапуск отправлена — сервер вернётся через несколько секунд')

const showOwnerConfirm = ref(false)

const askSetOwner = () => {
  if (!ownerValid.value) return
  showOwnerConfirm.value = true
}
</script>

<style lang="scss" scoped>
@use '~/assets/css/mixins' as *;

.restart-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.inline-form {
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
