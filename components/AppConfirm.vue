<template>
  <Teleport to="body">
    <div v-if="modelValue" class="confirm-overlay" @click.self="cancel">
      <div class="confirm-modal">
        <p class="confirm-text">{{ message }}</p>
        <div class="confirm-actions">
          <AppButton variant="ghost" @click="cancel">Нет</AppButton>
          <AppButton variant="danger" @click="confirm">Да</AppButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  message: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()

const cancel = () => {
  emit('update:modelValue', false)
}

const confirm = () => {
  emit('confirm')
  emit('update:modelValue', false)
}
</script>

<style lang="scss" scoped>
@use '~/assets/css/mixins' as *;

.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.confirm-modal {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  max-width: 400px;
  width: calc(100% - 32px);

  @include mobile {
    padding: 20px;
  }
}

.confirm-text {
  font-size: 0.9375rem;
  line-height: 1.5;
  margin-bottom: 20px;
  color: var(--text);
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
