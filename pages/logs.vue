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

    <AppDataState :loading="loading" :error="error" :empty="!parsedLines.length" empty-text="Нет логов за выбранную дату">
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
