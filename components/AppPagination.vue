<template>
  <div v-if="totalPages > 1" class="pagination" :class="{ embedded }">
    <span class="pagination-info">
      {{ (page - 1) * perPage + 1 }}–{{ Math.min(page * perPage, total) }} из {{ total }}
    </span>

    <div class="pagination-controls">
      <AppButton
        variant="ghost"
        size="sm"
        :disabled="page <= 1"
        @click="$emit('goToPage', page - 1)"
      >
        ←
      </AppButton>

      <template v-for="(item, i) in pageNumbers(page, totalPages)" :key="i">
        <span v-if="item === '...'" class="pagination-dots">...</span>
        <AppButton
          v-else
          size="sm"
          :variant="item === page ? 'primary' : 'ghost'"
          @click="$emit('goToPage', Number(item))"
        >
          {{ item }}
        </AppButton>
      </template>

      <AppButton
        variant="ghost"
        size="sm"
        :disabled="page >= totalPages"
        @click="$emit('goToPage', page + 1)"
      >
        →
      </AppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { pageNumbers } from '~/utils/pagination'

withDefaults(
  defineProps<{
    page: number
    perPage: number
    total: number
    totalPages: number
    embedded?: boolean
  }>(),
  { embedded: false },
)

defineEmits<{
  goToPage: [page: number]
}>()
</script>

<style lang="scss" scoped>
@use '~/assets/css/mixins' as *;

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;

  &.embedded {
    margin-top: 0;
    padding: 12px 20px;
    border-top: 1px solid var(--border);
  }

  @include mobile {
    flex-direction: column;
    gap: 12px;
  }
}

.pagination-info {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.053em;
  color: var(--text-muted);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-dots {
  padding: 0 6px;
  color: var(--text-faint);
  font-family: var(--font-mono);
  font-size: 0.6875rem;
}
</style>
