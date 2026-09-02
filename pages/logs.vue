<template>
  <WidgetLogFilters
    :dates="dates"
    :selected-date="selectedDate"
    :status-code="statusCode"
    :url="urlFilter"
    :ip="ipFilter"
    :level-filter="levelFilter"
    :limit="limit"
    @update:selected-date="selectedDate = $event"
    @update:status-code="statusCode = $event"
    @update:url="urlFilter = $event"
    @update:ip="ipFilter = $event"
    @update:level-filter="levelFilter = $event"
    @update:limit="limit = $event"
    @date-change="onDateChange"
    @limit-change="fetchLogs"
  />

  <AppDataState :loading="loading" :error="error" :empty="!parsedLines.length" :empty-text="emptyText">
    <WidgetLogTable
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
  </AppDataState>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const {
  dates, selectedDate, parsedLines, offset, limit, total,
  currentPage, totalPages,
  loading, error, levelFilter, urlFilter, ipFilter, statusCode, expandedRow,
  toggleRow, fetchDates, fetchLogs, onDateChange, goToPage,
} = useLogs()

const emptyText = computed(() =>
  levelFilter.value || urlFilter.value || ipFilter.value || statusCode.value
    ? 'Ничего не найдено по текущим фильтрам'
    : 'Нет логов за выбранную дату')

onMounted(fetchDates)
</script>
