<template>
  <div>
    <div class="toolbar">
      <AppButton variant="ghost" size="sm" @click="$emit('refresh')">Обновить</AppButton>
    </div>

    <AppDataState :loading="loading" :error="error" :empty="!users.length" empty-text="Нет неодобренных пользователей">
      <AppResponsiveList :items="users" :columns="columns" :item-key="userKey">
        <template #row="{ item }">
          <tr>
            <td>{{ item.username }}</td>
            <td>{{ formatDate(item.createdAt) }}</td>
            <td>
              <AppButton
                variant="success"
                size="sm"
                :loading="approving === item.username"
                @click="$emit('approve', item.username)"
              >
                Одобрить
              </AppButton>
            </td>
          </tr>
        </template>

        <template #card="{ item }">
          <div class="user-card">
            <div class="user-card-info">
              <span class="user-card-name">{{ item.username }}</span>
              <span class="user-card-date">{{ formatDate(item.createdAt) }}</span>
            </div>
            <AppButton
              variant="success"
              size="sm"
              class="user-card-btn"
              :loading="approving === item.username"
              @click="$emit('approve', item.username)"
            >
              Одобрить
            </AppButton>
          </div>
        </template>
      </AppResponsiveList>

      <AppPagination
        :page="page"
        :per-page="UNAPPROVED_PER_PAGE"
        :total="total"
        :total-pages="totalPages"
        @go-to-page="$emit('goToPage', $event)"
      />
    </AppDataState>
  </div>
</template>

<script setup lang="ts">
import type { UnapprovedUser } from '~/api/types'
import { formatDate } from '~/utils/format'
import { UNAPPROVED_PER_PAGE } from '~/composables/useUnapprovedUsers'

defineProps<{
  users: UnapprovedUser[]
  page: number
  total: number
  totalPages: number
  loading: boolean
  error: string
  approving: string
}>()

defineEmits<{
  goToPage: [page: number]
  refresh: []
  approve: [username: string]
}>()

const columns = ['Имя пользователя', 'Дата регистрации', 'Действие']

const userKey = (user: UnapprovedUser) => user.username
</script>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.user-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.user-card-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-card-name {
  font-size: 0.875rem;
  color: var(--text-bright);
}

.user-card-date {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--text-muted);
}

.user-card-btn {
  flex-shrink: 0;
}
</style>
