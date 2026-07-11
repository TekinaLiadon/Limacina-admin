<template>
  <div>
    <div class="toolbar">
      <button class="btn btn-ghost btn-sm" @click="$emit('refresh')">Обновить</button>
    </div>

    <AppSpinner v-if="loading" />
    <AppAlert v-else-if="error" :message="error" type="error" />

    <div v-else-if="!users.length" class="card empty-state">
      <p>Нет неодобренных пользователей</p>
    </div>

    <template v-else>
      <div class="card table-wrap desktop-table">
        <table>
          <thead>
            <tr>
              <th>Имя пользователя</th>
              <th>Дата регистрации</th>
              <th>Действие</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.username">
              <td>{{ user.username }}</td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>
                <button
                  class="btn btn-success btn-sm"
                  :disabled="approving === user.username"
                  @click="$emit('approve', user.username)"
                >
                  <span v-if="approving === user.username" class="spinner"></span>
                  <span v-else>Одобрить</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mobile-cards">
        <div v-for="user in users" :key="user.username" class="user-card">
          <div class="user-card-info">
            <span class="user-card-name">{{ user.username }}</span>
            <span class="user-card-date">{{ formatDate(user.createdAt) }}</span>
          </div>
          <button
            class="btn btn-success btn-sm user-card-btn"
            :disabled="approving === user.username"
            @click="$emit('approve', user.username)"
          >
            <span v-if="approving === user.username" class="spinner"></span>
            <span v-else>Одобрить</span>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  users: Array<{ username: string; createdAt: string }>
  loading: boolean
  error: string
  approving: string
  formatDate: (date: string) => string
}>()

defineEmits<{
  refresh: []
  approve: [username: string]
}>()
</script>

<style lang="scss" scoped>
@use '~/assets/css/mixins' as *;

.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

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
  gap: 2px;
}

.user-card-name {
  font-weight: 600;
  font-size: 0.875rem;
}

.user-card-date {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.user-card-btn {
  flex-shrink: 0;
}
</style>
