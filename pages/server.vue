<template>
  <div>
    <AppAlert v-if="restarted" message="Команда на перезапуск отправлена — сервер вернётся через несколько секунд" type="success" />
    <AppAlert v-if="error" :message="error" type="error" />

    <div class="card server-card">
      <h2 class="widget-title">Перезапуск сервера</h2>
      <p class="server-description">
        Аккуратно останавливает Limacina-core: ответ уходит до остановки, соединения закрываются
        graceful, подъём процесса обеспечивает менеджер процессов (pm2). Панель и API могут быть
        недоступны несколько секунд.
      </p>
      <AppButton variant="danger" :loading="restarting" @click="showConfirm = true">
        Перезапустить сервер
      </AppButton>
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

const { restarting, error, restarted, restartServer } = useServerControl()

const showConfirm = ref(false)
</script>

<style lang="scss" scoped>
.server-description {
  margin: 12px 0 20px;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--text-muted);
  max-width: 640px;
}
</style>
