<template>
  <div>
    <AppSpinner v-if="loading" />
    <AppAlert v-else-if="error" :message="error" type="error" />

    <div v-else class="card table-wrap">
      <table class="desktop-table">
        <thead>
          <tr>
            <th>Имя пользователя</th>
            <th>Роль</th>
            <th>Одобрение</th>
            <th>Бан</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.username">
            <td>{{ user.username }}</td>
            <td>
              <template v-if="user.role === 'owner'">
                <span class="badge badge-owner">owner</span>
              </template>
              <select
                v-else
                class="input role-select"
                :value="user.role"
                :disabled="acting === user.username"
                @change="$emit('changeRole', user, ($event.target as HTMLSelectElement).value)"
              >
                <option value="admin">admin</option>
                <option value="moderator">moderator</option>
                <option value="user">user</option>
              </select>
            </td>
            <td>
              <select
                class="input role-select"
                :value="String(user.approved)"
                :disabled="acting === user.username || user.role === 'owner'"
                @change="$emit('changeApproved', user, ($event.target as HTMLSelectElement).value === 'true')"
              >
                <option value="true">Одобрен</option>
                <option value="false">Не одобрен</option>
              </select>
            </td>
            <td>
              <select
                class="input role-select"
                :value="String(user.banned)"
                :disabled="acting === user.username || user.role === 'owner'"
                @change="$emit('changeBanned', user, ($event.target as HTMLSelectElement).value === 'true')"
              >
                <option value="false">Нет</option>
                <option value="true">Да</option>
              </select>
            </td>
            <td>
              <button
                class="btn btn-danger btn-sm"
                :disabled="acting === user.username || user.role === 'owner'"
                @click="$emit('deleteUser', user)"
              >
                <span v-if="acting === user.username" class="spinner"></span>
                <span v-else>Удалить</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="mobile-cards">
        <div v-for="user in users" :key="user.username" class="user-card">
          <div class="user-card-header">
            <span class="user-card-name">{{ user.username }}</span>
            <span v-if="user.role === 'owner'" class="badge badge-owner">owner</span>
          </div>

          <div class="user-card-fields">
            <div class="user-card-field">
              <label>Роль</label>
              <select
                v-if="user.role !== 'owner'"
                class="input role-select"
                :value="user.role"
                :disabled="acting === user.username"
                @change="$emit('changeRole', user, ($event.target as HTMLSelectElement).value)"
              >
                <option value="admin">admin</option>
                <option value="moderator">moderator</option>
                <option value="user">user</option>
              </select>
            </div>

            <div class="user-card-field">
              <label>Одобрение</label>
              <select
                class="input role-select"
                :value="String(user.approved)"
                :disabled="acting === user.username || user.role === 'owner'"
                @change="$emit('changeApproved', user, ($event.target as HTMLSelectElement).value === 'true')"
              >
                <option value="true">Одобрен</option>
                <option value="false">Не одобрен</option>
              </select>
            </div>

            <div class="user-card-field">
              <label>Бан</label>
              <select
                class="input role-select"
                :value="String(user.banned)"
                :disabled="acting === user.username || user.role === 'owner'"
                @change="$emit('changeBanned', user, ($event.target as HTMLSelectElement).value === 'true')"
              >
                <option value="false">Нет</option>
                <option value="true">Да</option>
              </select>
            </div>
          </div>

          <button
            v-if="user.role !== 'owner'"
            class="btn btn-danger btn-sm user-card-delete"
            :disabled="acting === user.username"
            @click="$emit('deleteUser', user)"
          >
            <span v-if="acting === user.username" class="spinner"></span>
            <span v-else>Удалить</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserListItem } from '~/composables/useUsers'

defineProps<{
  users: UserListItem[]
  loading: boolean
  error: string
  acting: string
}>()

defineEmits<{
  changeRole: [user: UserListItem, role: string]
  changeApproved: [user: UserListItem, approved: boolean]
  changeBanned: [user: UserListItem, banned: boolean]
  deleteUser: [user: UserListItem]
}>()
</script>

<style lang="scss" scoped>
@use '~/assets/css/mixins' as *;

.desktop-table {
  @include mobile {
    display: none;
  }
}

.mobile-cards {
  display: none;

  @include mobile {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}

.user-card {
  background: var(--bg);
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
  font-weight: 600;
  font-size: 0.9375rem;
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
    font-size: 0.75rem;
    color: var(--text-muted);
  }
}

.user-card-delete {
  width: 100%;
  justify-content: center;
}

.role-select {
  width: auto;
  min-width: 110px;
  padding: 4px 8px;
  font-size: 0.8125rem;
  cursor: pointer;

  @include mobile {
    min-width: 0;
    width: 100%;
  }
}

.badge-owner {
  background: rgba(99, 102, 241, 0.15);
  color: var(--primary);
  padding: 4px 12px;
  font-weight: 600;
  font-size: 0.8125rem;
}
</style>
