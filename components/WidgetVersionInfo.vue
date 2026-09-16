<template>
  <div class="card">
    <h2 class="widget-title">Актуальный релиз (latest.json)</h2>
    <div v-if="latest" class="version-info">
      <div class="version-row">
        <span class="config-label">Версия</span>
        <span>{{ latest.version }}</span>
      </div>
      <div class="version-row">
        <span class="config-label">Опубликовано</span>
        <span class="pub-date">{{ formatDate(latest.pub_date) }}</span>
      </div>
      <div class="version-platforms">
        <a
          v-for="(release, key) in latest.platforms"
          :key="key"
          :href="release.url"
          class="version-platform-card"
          target="_blank"
          rel="noopener"
        >
          <span class="platform-label">{{ updaterPlatformLabel(key) }}</span>
          <span class="platform-download">Скачать</span>
        </a>
      </div>
    </div>
    <div v-else class="empty-state">
      <p>Нет опубликованных релизов</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UpdaterLatest } from '~/api/types'
import { updaterPlatformLabel } from '~/utils/updaterPlatforms'
import { formatDate } from '~/utils/format'

defineProps<{
  latest: UpdaterLatest | null
}>()
</script>

<style lang="scss" scoped>
@use '~/assets/css/mixins' as *;

.version-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.version-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.config-label {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.058em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.version-row span:last-child {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: var(--primary);
}

.pub-date {
  color: var(--text) !important;
  font-size: 0.6875rem !important;
  letter-spacing: 0.053em;
}

.version-platforms {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;

  @include mobile {
    grid-template-columns: 1fr;
  }
}

.version-platform-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg);
  text-decoration: none;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s;
  height: 44px;

  &:hover {
    border-color: rgba(0, 216, 146, 0.5);
  }
}

.platform-label,
.platform-download {
  position: absolute;
  white-space: nowrap;
  transition: opacity 0.25s, transform 0.25s;
}

.platform-label {
  opacity: 1;
  transform: translateY(0);
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.058em;
  text-transform: uppercase;
  color: var(--text);
}

.platform-download {
  opacity: 0;
  transform: translateY(12px);
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.058em;
  text-transform: uppercase;
  color: var(--primary);
}

.version-platform-card:hover .platform-label {
  opacity: 0;
  transform: translateY(-12px);
}

.version-platform-card:hover .platform-download {
  opacity: 1;
  transform: translateY(0);
}
</style>
