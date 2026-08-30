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
                <AppButton
                  variant="ghost"
                  size="sm"
                  class="expand-btn"
                  @click.stop="$emit('toggleRow', i)"
                >
                  {{ expandedRow === i ? 'Свернуть' : 'Подробнее' }}
                </AppButton>
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

    <AppPagination
      embedded
      :page="currentPage"
      :per-page="limit"
      :total="total"
      :total-pages="totalPages"
      @go-to-page="$emit('goToPage', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import {
  type LogEntry,
  levelName, levelBadge, statusBadge, rowClass, formatTime,
} from '~/utils/logHelpers'

defineProps<{
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
</script>

<style lang="scss" scoped>
@use '~/assets/css/mixins' as *;

.logs-card {
  padding: 0;
  overflow: hidden;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
  font-family: var(--font-mono);

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
  background: rgba(255, 98, 133, 0.04);
}

.row-warn td {
  background: rgba(212, 168, 67, 0.04);
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
    background: rgba(255, 98, 133, 0.04);
  }

  &.row-warn {
    background: rgba(212, 168, 67, 0.04);
  }
}

.log-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.log-card-time {
  font-size: 0.6875rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.log-card-method {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--primary);
  font-family: var(--font-mono);
  margin-bottom: 2px;
}

.log-card-url {
  font-size: 0.75rem;
  font-family: var(--font-mono);
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
  font-size: 0.6875rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.log-card-expand {
  font-size: 0.6875rem;
  color: var(--primary);
  font-family: var(--font-mono);
  letter-spacing: 0.053em;
  text-transform: uppercase;
}
</style>
