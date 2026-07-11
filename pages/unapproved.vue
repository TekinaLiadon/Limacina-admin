<template>
  <WidgetUnapprovedTable
    :users="users"
    :loading="loading"
    :error="error"
    :approving="approving"
    :format-date="formatDate"
    @refresh="fetchUsers"
    @approve="approveUser"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const { users, error, loading, approving, fetchUsers, approveUser, formatDate } = useUnapprovedUsers()

onMounted(fetchUsers)
</script>
