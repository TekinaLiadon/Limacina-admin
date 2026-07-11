<template>
  <tr class="detail-row">
    <td colspan="7">
      <div class="detail-panel" @click.stop>
        <div class="detail-section">
          <h4>Запрос</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Метод</span>
              <span class="detail-value method-value">{{ entry.req?.method || '—' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">URL</span>
              <span class="detail-value">{{ entry.req?.url || '—' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">ID</span>
              <span class="detail-value">{{ entry.req?.id || '—' }}</span>
            </div>
            <div class="detail-item" v-if="entry.req?.remoteAddress">
              <span class="detail-label">IP</span>
              <span class="detail-value">{{ entry.req.remoteAddress }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section" v-if="entry.req?.query && Object.keys(entry.req.query).length">
          <h4>Query параметры</h4>
          <pre class="detail-code highlight-code">{{ formatJson(entry.req.query) }}</pre>
        </div>

        <div class="detail-section" v-if="entry.req?.body">
          <h4>Тело запроса</h4>
          <pre class="detail-code highlight-code">{{ formatJson(entry.req.body) }}</pre>
        </div>

        <div class="detail-section" v-if="entry.req?.headers && Object.keys(entry.req.headers).length">
          <h4>Заголовки</h4>
          <pre class="detail-code highlight-code">{{ formatJson(entry.req.headers) }}</pre>
        </div>

        <div class="detail-section">
          <h4>Ответ</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Статус</span>
              <span :class="['detail-value', 'badge', entry.res?.statusCode ? statusBadge(entry.res.statusCode) : '']">{{ entry.res?.statusCode || '—' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Время</span>
              <span class="detail-value">{{ entry.responseTime != null ? entry.responseTime + ' мс' : '—' }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section" v-if="entry.res?.headers && Object.keys(entry.res.headers).length">
          <h4>Заголовки ответа</h4>
          <pre class="detail-code highlight-code">{{ formatJson(entry.res.headers) }}</pre>
        </div>

        <div class="detail-section" v-if="entry.err">
          <h4>Ошибка</h4>
          <div class="detail-grid">
            <div class="detail-item" v-if="entry.err.type">
              <span class="detail-label">Тип</span>
              <span class="detail-value error-value">{{ entry.err.type }}</span>
            </div>
            <div class="detail-item" v-if="entry.err.message">
              <span class="detail-label">Сообщение</span>
              <span class="detail-value error-value">{{ entry.err.message }}</span>
            </div>
          </div>
          <pre v-if="entry.err.stack" class="detail-code error-code">{{ entry.err.stack }}</pre>
        </div>

        <div class="detail-section">
          <h4>Мета</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Уровень</span>
              <span :class="['badge', levelBadge(entry.level)]">{{ levelName(entry.level) }}</span>
            </div>
            <div class="detail-item" v-if="entry.pid">
              <span class="detail-label">PID</span>
              <span class="detail-value">{{ entry.pid }}</span>
            </div>
            <div class="detail-item" v-if="entry.hostname">
              <span class="detail-label">Хост</span>
              <span class="detail-value">{{ entry.hostname }}</span>
            </div>
            <div class="detail-item" v-if="entry.name">
              <span class="detail-label">Имя</span>
              <span class="detail-value">{{ entry.name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Время</span>
              <span class="detail-value">{{ formatDateTime(entry.time) }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section" v-if="entry.msg">
          <h4>Сообщение</h4>
          <pre class="detail-code">{{ entry.msg }}</pre>
        </div>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import {
  type LogEntry,
  levelName, levelBadge, statusBadge,
  formatDateTime, formatJson,
} from '~/utils/logHelpers'

defineProps<{
  entry: LogEntry
}>()
</script>

<style lang="scss" scoped>
.detail-row td {
  padding: 0;
  border-bottom: 1px solid var(--border);
}

.detail-panel {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
  padding: 16px 20px;
}

.detail-section {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  h4 {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    margin: 0 0 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
}

.detail-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.detail-value {
  font-size: 0.8125rem;
  font-family: 'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace;
}

.method-value {
  font-weight: 700;
  color: var(--primary);
}

.error-value {
  color: var(--danger);
}

.detail-code {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 12px;
  margin: 0;
  font-size: 0.75rem;
  font-family: 'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;

  &.error-code {
    border-color: rgba(239, 68, 68, 0.3);
    background: rgba(239, 68, 68, 0.05);
    color: var(--danger);
  }

  &.highlight-code {
    color: var(--text);
  }
}
</style>
