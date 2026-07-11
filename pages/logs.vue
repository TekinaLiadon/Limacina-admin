<template>
  <div>
    <WidgetLogFilters
      :dates="dates"
      :selected-date="selectedDate"
      :level-filter="levelFilter"
      :limit="limit"
      @update:selected-date="selectedDate = $event"
      @update:level-filter="levelFilter = $event"
      @update:limit="limit = $event"
      @date-change="onDateChange"
      @limit-change="fetchLogs"
    />

    <AppSpinner v-if="loading" />
    <AppAlert v-else-if="error" :message="error" type="error" />

    <WidgetLogTable
      v-else-if="parsedLines.length"
      :parsed-lines="parsedLines"
      :expanded-row="expandedRow"
      :offset="offset"
      :limit="limit"
      :total="total"
      :current-page="currentPage"
      :total-pages="totalPages"
      @toggle-row="toggleRow"
      @go-to-page="goToPage"
    />

    <div v-else class="card empty-logs">
      Нет логов за выбранную дату
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const {
  dates, selectedDate, parsedLines, offset, limit, total,
  currentPage, totalPages,
  loading, error, levelFilter, expandedRow,
  toggleRow, fetchDates, fetchLogs, onDateChange, goToPage,
} = useLogs()

onMounted(fetchDates)
</script>

<style lang="scss" scoped>
.empty-logs {
  padding: 32px;
  text-align: center;
  color: var(--text-muted);
}
</style>
