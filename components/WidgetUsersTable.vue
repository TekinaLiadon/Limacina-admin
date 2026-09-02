<template>
  <div>
    <div class="toolbar">
      <div class="form-group search-group">
        <label for="users-search">Поиск</label>
        <input
          id="users-search"
          type="text"
          class="input"
          :value="search"
          placeholder="Начало имени пользователя"
          @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
        >
      </div>
    </div>

    <AppDataState :loading="loading" :error="error" :empty="!users.length" empty-text="Нет пользователей">
      <AppResponsiveList :items="users" :columns="columns" :item-key="userKey">
        <template #row="{ item }">
          <tr>
            <td>{{ item.username }}</td>
            <td>
              <template v-if="item.role === 'owner'">
                <span class="badge badge-owner">owner</span>
              </template>
              <select
                v-else
                class="input role-select"
                :value="item.role"
                :disabled="acting === item.username"
                @change="$emit('changeRole', item, ($event.target as HTMLSelectElement).value)"
              >
                <option value="admin">admin</option>
                <option value="moderator">moderator</option>
                <option value="user">user</option>
              </select>
            </td>
            <td>
              <select
                class="input role-select"
                :value="String(item.approved)"
                :disabled="acting === item.username || item.role === 'owner'"
                @change="$emit('changeApproved', item, ($event.target as HTMLSelectElement).value === 'true')"
              >
                <option value="true">Одобрен</option>
                <option value="false">Не одобрен</option>
              </select>
            </td>
            <td>
              <select
                class="input role-select"
                :value="String(item.banned)"
                :disabled="acting === item.username || item.role === 'owner'"
                @change="$emit('changeBanned', item, ($event.target as HTMLSelectElement).value === 'true')"
              >
                <option value="false">Нет</option>
                <option value="true">Да</option>
              </select>
            </td>
            <td>
              <AppButton
                variant="danger"
                size="sm"
                :loading="acting === item.username"
                :disabled="item.role === 'owner'"
                @click="$emit('deleteUser', item)"
              >
                Удалить
              </AppButton>
            </td>
          </tr>
        </template>

        <template #card="{ item }">
          <div class="user-card">
            <div class="user-card-header">
              <span class="user-card-name">{{ item.username }}</span>
              <span v-if="item.role === 'owner'" class="badge badge-owner">owner</span>
            </div>

            <div class="user-card-fields">
              <div class="user-card-field">
                <label>Роль</label>
                <select
                  v-if="item.role !== 'owner'"
                  class="input role-select"
                  :value="item.role"
                  :disabled="acting === item.username"
                  @change="$emit('changeRole', item, ($event.target as HTMLSelectElement).value)"
                >
                  <option value="admin">admin</option>
                  <option value="moderator">moderator</option>
                  <option value="user">user</option>
                </select>
                <span v-else class="badge badge-owner">owner</span>
              </div>

              <div class="user-card-field">
                <label>Одобрение</label>
                <select
                  class="input role-select"
                  :value="String(item.approved)"
                  :disabled="acting === item.username || item.role === 'owner'"
                  @change="$emit('changeApproved', item, ($event.target as HTMLSelectElement).value === 'true')"
                >
                  <option value="true">Одобрен</option>
                  <option value="false">Не одобрен</option>
                </select>
              </div>

              <div class="user-card-field">
                <label>Бан</label>
                <select
                  class="input role-select"
                  :value="String(item.banned)"
                  :disabled="acting === item.username || item.role === 'owner'"
                  @change="$emit('changeBanned', item, ($event.target as HTMLSelectElement).value === 'true')"
                >
                  <option value="false">Нет</option>
                  <option value="true">Да</option>
                </select>
              </div>
            </div>

            <AppButton
              v-if="item.role !== 'owner'"
              variant="danger"
              size="sm"
              class="user-card-delete"
              :loading="acting === item.username"
              @click="$emit('deleteUser', item)"
            >
              Удалить
            </AppButton>
          </div>
        </template>
      </AppResponsiveList>

      <AppPagination
        :page="page"
        :per-page="USERS_PER_PAGE"
        :total="total"
        :total-pages="totalPages"
        @go-to-page="$emit('goToPage', $event)"
      />
    </AppDataState>
  </div>
</template>

<script setup lang="ts">
import type { UserListItem } from '~/api/types'
import { USERS_PER_PAGE } from '~/composables/useUsers'

defineProps<{
  users: UserListItem[]
  page: number
  search: string
  total: number
  totalPages: number
  loading: boolean
  error: string
  acting: string
}>()

defineEmits<{
  goToPage: [page: number]
  'update:search': [value: string]
  changeRole: [user: UserListItem, role: string]
  changeApproved: [user: UserListItem, approved: boolean]
  changeBanned: [user: UserListItem, banned: boolean]
  deleteUser: [user: UserListItem]
}>()

const columns = ['Имя пользователя', 'Роль', 'Одобрение', 'Бан', '']

const userKey = (user: UserListItem) => user.username
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

.user-card-delete {
  width: 100%;
}

.role-select {
  width: auto;
  min-width: 110px;
  padding: 4px 26px 4px 8px;
  font-size: 0.75rem;

  @include mobile {
    min-width: 0;
    width: 100%;
  }
}

.badge-owner {
  background: var(--bg-secondary);
  color: var(--violet);
  padding: 2px 8px;
  box-shadow: inset 0 0 0 1px rgba(197, 138, 255, 0.22);
}
</style>
