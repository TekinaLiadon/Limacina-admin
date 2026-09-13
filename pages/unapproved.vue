<template>
  <WidgetUnapprovedTable
    :users="users"
    :page="page"
    :total="total"
    :total-pages="totalPages"
    :loading="loading"
    :error="error"
    :approving="approving"
    :action-error="actionError"
    @go-to-page="goToPage"
    @refresh="fetchUsers"
    @approve="approveUser"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const { users, page, total, totalPages, error, actionError, loading, approving, fetchUsers, goToPage, approveUser } = useUnapprovedUsers()

onMounted(fetchUsers)
</script>
