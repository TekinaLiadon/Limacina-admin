<template>
  <div>
    <div class="toolbar">
      <div class="form-group search-group">
        <label for="deleted-search">Поиск</label>
        <input
          id="deleted-search"
          type="text"
          class="input"
          :value="search"
          placeholder="Начало имени пользователя"
          @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
        >
      </div>
    </div>

    <AppDataState :loading="loading" :error="error" :empty="!users.length" empty-text="Нет удалённых пользователей">
      <AppResponsiveList :items="users" :columns="columns" :item-key="userKey">
        <template #row="{ item }">
          <tr>
            <td>{{ item.username }}</td>
            <td>{{ item.role }}</td>
            <td>{{ item.approved ? 'Одобрен' : 'Не одобрен' }}</td>
            <td>{{ item.banned ? 'Да' : 'Нет' }}</td>
            <td>{{ formatDate(item.deletedAt) }}</td>
            <td>
              <AppButton
                variant="success"
                size="sm"
                :loading="restoring === item.username"
                @click="$emit('restore', item.username)"
              >
                Восстановить
              </AppButton>
            </td>
          </tr>
        </template>

        <template #card="{ item }">
          <div class="user-card">
            <div class="user-card-header">
              <span class="user-card-name">{{ item.username }}</span>
              <span class="user-card-date">{{ formatDate(item.deletedAt) }}</span>
            </div>

            <div class="user-card-fields">
              <div class="user-card-field">
                <label>Роль</label>
                <span>{{ item.role }}</span>
              </div>
              <div class="user-card-field">
                <label>Одобрение</label>
                <span>{{ item.approved ? 'Одобрен' : 'Не одобрен' }}</span>
              </div>
              <div class="user-card-field">
                <label>Бан</label>
                <span>{{ item.banned ? 'Да' : 'Нет' }}</span>
              </div>
            </div>

            <AppButton
              variant="success"
              size="sm"
              class="user-card-btn"
              :loading="restoring === item.username"
              @click="$emit('restore', item.username)"
            >
              Восстановить
            </AppButton>
          </div>
        </template>
      </AppResponsiveList>

      <AppPagination
        :page="page"
        :per-page="DELETED_PER_PAGE"
        :total="total"
        :total-pages="totalPages"
        @go-to-page="$emit('goToPage', $event)"
      />
    </AppDataState>
  </div>
</template>

<script setup lang="ts">
import type { DeletedUserListItem } from '~/api/types'
import { formatDate } from '~/utils/format'
import { DELETED_PER_PAGE } from '~/composables/useDeletedUsers'

defineProps<{
  users: DeletedUserListItem[]
  page: number
  search: string
  total: number
  totalPages: number
  loading: boolean
  error: string
  restoring: string
}>()

defineEmits<{
  goToPage: [page: number]
  'update:search': [value: string]
  restore: [username: string]
}>()

const columns = ['Имя пользователя', 'Роль', 'Одобрение', 'Бан', 'Дата удаления', '']

const userKey = (user: DeletedUserListItem) => user.username
</script>

<style lang="scss" scoped>
@use '~/assets/css/mixins' as *;

.toolbar {
  margin-bottom: 16px;
}

.search-group {
  max-width: 320px;

  @include mobile {
    max-width: none;
    width: 100%;
  }
}

.user-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
}

.user-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.user-card-name {
  font-size: 0.9375rem;
  color: var(--text-bright);
}

.user-card-date {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--text-muted);
}

.user-card-fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
}

.user-card-field {
  display: flex;
  flex-direction: column;
  gap: 4px;

  label {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    letter-spacing: 0.058em;
    text-transform: uppercase;
    color: var(--text-muted);
  }
}

.user-card-btn {
  width: 100%;
}
</style>
