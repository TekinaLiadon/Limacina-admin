<template>
  <WidgetDeletedTable
    :users="users"
    :page="page"
    :search="search"
    :total="total"
    :total-pages="totalPages"
    :loading="loading"
    :error="error"
    :restoring="restoring"
    @go-to-page="goToPage"
    @update:search="search = $event"
    @restore="restoreUser"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'owner',
})

const { users, page, search, total, totalPages, loading, error, restoring, fetchUsers, goToPage, restoreUser } = useDeletedUsers()

onMounted(fetchUsers)
</script>
