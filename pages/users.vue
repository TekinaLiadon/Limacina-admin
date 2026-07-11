<template>
  <div>
    <WidgetUsersTable
      :users="users"
      :loading="loading"
      :error="error"
      :acting="acting"
      @change-role="changeRole"
      @change-approved="changeApproved"
      @change-banned="changeBanned"
      @delete-user="askDelete"
    />

    <AppConfirm
      v-model="showConfirm"
      :message="`Вы уверены что хотите удалить пользователя ${deleteTarget}?`"
      @confirm="deleteUser(deleteTarget)"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const { users, loading, error, acting, fetchUsers, changeRole, changeApproved, changeBanned, deleteUser } = useUsers()

const showConfirm = ref(false)
const deleteTarget = ref('')

const askDelete = (user: { username: string }) => {
  deleteTarget.value = user.username
  showConfirm.value = true
}

onMounted(fetchUsers)
</script>
