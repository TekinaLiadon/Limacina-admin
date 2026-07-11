<template>
  <div class="card logs-card">
    <div class="table-wrap desktop-table">
      <table class="logs-table">
        <thead>
          <tr>
            <th>Время</th>
            <th>Уровень</th>
            <th>Метод</th>
            <th>URL</th>
            <th>Ответ (мс)</th>
            <th>Статус</th>
            <th class="col-expand"></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(entry, i) in parsedLines" :key="i">
            <tr
              :class="[rowClass(entry), { 'row-expanded': expandedRow === i }]"
              class="log-row"
              @click="$emit('toggleRow', i)"
            >
              <td class="col-time">{{ formatTime(entry.time) }}</td>
              <td class="col-level"><span :class="['badge', levelBadge(entry.level)]">{{ levelName(entry.level) }}</span></td>
              <td class="col-method">{{ entry.req?.method || '—' }}</td>
              <td class="col-url">{{ entry.req?.url || entry.msg || '—' }}</td>
              <td class="col-response-time">{{ entry.responseTime ?? '—' }}</td>
              <td class="col-status">
                <span v-if="entry.res?.statusCode" :class="['badge', statusBadge(entry.res.statusCode)]">
                  {{ entry.res.statusCode }}
                </span>
                <span v-else class="text-muted">—</span>
              </td>
              <td class="col-expand">
                <button class="btn btn-ghost btn-sm expand-btn" @click.stop="$emit('toggleRow', i)">
                  {{ expandedRow === i ? 'Свернуть' : 'Подробнее' }}
                </button>
              </td>
            </tr>
            <WidgetLogDetail
              v-if="expandedRow === i"
              :entry="entry"
            />
          </template>
        </tbody>
      </table>
    </div>

    <div class="mobile-cards">
      <div
        v-for="(entry, i) in parsedLines"
        :key="i"
        :class="['log-card', rowClass(entry)]"
        @click="$emit('toggleRow', i)"
      >
        <div class="log-card-header">
          <span class="log-card-time">{{ formatTime(entry.time) }}</span>
          <span :class="['badge', levelBadge(entry.level)]">{{ levelName(entry.level) }}</span>
          <span v-if="entry.res?.statusCode" :class="['badge', statusBadge(entry.res.statusCode)]">
            {{ entry.res.statusCode }}
          </span>
        </div>
        <div class="log-card-method">{{ entry.req?.method || '—' }}</div>
        <div class="log-card-url">{{ entry.req?.url || entry.msg || '—' }}</div>
        <div class="log-card-footer">
          <span v-if="entry.responseTime != null" class="log-card-time-value">{{ entry.responseTime }} мс</span>
          <span class="log-card-expand">{{ expandedRow === i ? 'Свернуть' : 'Подробнее' }}</span>
        </div>
        <WidgetLogDetail
          v-if="expandedRow === i"
          :entry="entry"
        />
      </div>
    </div>

    <div v-if="totalPages > 1" class="logs-pagination">
      <span class="logs-info">
        {{ offset + 1 }}–{{ Math.min(offset + limit, total) }} из {{ total }}
      </span>

      <div class="page-controls">
        <button
          class="btn btn-ghost btn-sm"
          :disabled="currentPage <= 1"
          @click="$emit('goToPage', currentPage - 1)"
        >
          ←
        </button>

        <template v-for="page in pageNumbers" :key="page">
          <span v-if="page === '...'" class="page-dots">...</span>
          <button
            v-else
            :class="['btn', 'btn-sm', page === currentPage ? 'btn-primary' : 'btn-ghost']"
            @click="$emit('goToPage', Number(page))"
          >
            {{ page }}
          </button>
        </template>

        <button
          class="btn btn-ghost btn-sm"
          :disabled="currentPage >= totalPages"
          @click="$emit('goToPage', currentPage + 1)"
        >
          →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  type LogEntry,
  levelName, levelBadge, statusBadge, rowClass, formatTime,
} from '~/utils/logHelpers'

const props = defineProps<{
  parsedLines: LogEntry[]
  expandedRow: number | null
  offset: number
  limit: number
  total: number
  currentPage: number
  totalPages: number
}>()

defineEmits<{
  toggleRow: [index: number]
  goToPage: [page: number]
}>()

const pageNumbers = computed(() => {
  const { currentPage, totalPages } = props
  const pages: (number | string)[] = []

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
    return pages
  }

  pages.push(1)

  if (currentPage > 3) pages.push('...')

  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  for (let i = start; i <= end; i++) pages.push(i)

  if (currentPage < totalPages - 2) pages.push('...')

  pages.push(totalPages)

  return pages
})
</script>

<style lang="scss" scoped>
@use '~/assets/css/mixins' as *;

.logs-card {
  padding: 0;
  overflow: hidden;
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
  }
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
  font-family: 'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace;

  th {
    position: sticky;
    top: 0;
    background: var(--bg-secondary);
    z-index: 1;
  }

  td {
    vertical-align: top;
    padding: 6px 10px;
    white-space: normal;
    word-break: break-all;
  }
}

.log-row {
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: var(--bg-hover);

    .expand-hint {
      opacity: 1;
    }

    .expand-btn {
      opacity: 1;
    }
  }

  &.row-expanded {
    background: var(--bg-hover);
    border-bottom-color: transparent;

    .expand-btn {
      opacity: 1;
    }
  }
}

.expand-btn {
  opacity: 0;
  transition: opacity 0.15s;
  white-space: nowrap;
}

.col-time {
  width: 100px;
  color: var(--text-muted);
  white-space: nowrap;
  word-break: normal;
  overflow-wrap: normal;
}

.col-method {
  width: 60px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--primary);
  white-space: nowrap;
  word-break: normal;
  overflow-wrap: normal;
}

.col-level {
  white-space: nowrap;
  word-break: normal;
  overflow-wrap: normal;
}

.col-url {
  min-width: 160px;
}

.col-response-time {
  width: 80px;
  text-align: right;
  white-space: nowrap;
  word-break: normal;
  overflow-wrap: normal;
}

.col-status {
  width: 60px;
  text-align: center;
  white-space: nowrap;
  word-break: normal;
  overflow-wrap: normal;
}

.col-expand {
  width: 90px;
}

.text-muted {
  color: var(--text-muted);
}

.row-error td {
  background: rgba(239, 68, 68, 0.05);
}

.row-warn td {
  background: rgba(245, 158, 11, 0.05);
}

.log-card {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: var(--bg-hover);
  }

  &.row-error {
    background: rgba(239, 68, 68, 0.05);
  }

  &.row-warn {
    background: rgba(245, 158, 11, 0.05);
  }
}

.log-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.log-card-time {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-family: 'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace;
}

.log-card-method {
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--primary);
  margin-bottom: 2px;
}

.log-card-url {
  font-size: 0.8125rem;
  font-family: 'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace;
  word-break: break-all;
  line-height: 1.4;
  margin-bottom: 8px;
}

.log-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.log-card-time-value {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.log-card-expand {
  font-size: 0.75rem;
  color: var(--primary);
}

.logs-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid var(--border);

  @include mobile {
    flex-direction: column;
    gap: 12px;
  }
}

.logs-info {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.page-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-dots {
  padding: 0 6px;
  color: var(--text-muted);
  font-size: 0.875rem;
}
</style>
