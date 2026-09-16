<template>
  <h2 class="widget-title history-title">История релизов</h2>

  <AppDataState :loading="loading" :error="error" :empty="!releases.length" empty-text="Нет опубликованных релизов">
    <AppResponsiveList :items="releases" :columns="columns" :item-key="releaseKey">
      <template #row="{ item }">
        <tr>
          <td>
            <span class="release-version">{{ item.version }}</span>
            <span v-if="item.version === latestVersion" class="badge badge-success">актуальная</span>
          </td>
          <td>{{ formatDate(item.pubDate) }}</td>
          <td>
            <span v-for="key in item.platforms" :key="key" class="badge platform-badge">
              {{ updaterPlatformLabel(key) }}
            </span>
          </td>
          <td>
            <a :href="latestJsonUrl(item.version)" class="latest-link" target="_blank" rel="noopener">
              latest.json
            </a>
          </td>
        </tr>
      </template>

      <template #card="{ item }">
        <div class="release-card">
          <div class="release-card-header">
            <span class="release-version">{{ item.version }}</span>
            <span v-if="item.version === latestVersion" class="badge badge-success">актуальная</span>
          </div>
          <div class="release-card-date">{{ formatDate(item.pubDate) }}</div>
          <div class="release-card-platforms">
            <span v-for="key in item.platforms" :key="key" class="badge platform-badge">
              {{ updaterPlatformLabel(key) }}
            </span>
          </div>
          <a :href="latestJsonUrl(item.version)" class="latest-link" target="_blank" rel="noopener">
            latest.json
          </a>
        </div>
      </template>
    </AppResponsiveList>
  </AppDataState>
</template>

<script setup lang="ts">
import type { UpdaterReleaseInfo } from '~/api/types'
import { ApiEndpoint } from '~/api/endpoints'
import { buildQuery } from '~/api/query'
import { updaterPlatformLabel } from '~/utils/updaterPlatforms'
import { formatDate } from '~/utils/format'

defineProps<{
  releases: UpdaterReleaseInfo[]
  latestVersion: string
  loading: boolean
  error: string
}>()

const config = useRuntimeConfig()

const columns = ['Версия', 'Дата', 'Платформы', '']

const releaseKey = (release: UpdaterReleaseInfo): string => release.version

const latestJsonUrl = (version: string): string =>
  `${config.public.apiBase}${ApiEndpoint.LauncherLatest}${buildQuery({ version })}`
</script>

<style lang="scss" scoped>
.history-title {
  margin-top: 24px;
}

.release-version {
  font-family: var(--font-mono);
  color: var(--primary);
}

.platform-badge {
  margin-right: 6px;
}

.latest-link {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.053em;
  text-transform: uppercase;
  color: var(--text-muted);
  text-decoration: none;
  border-bottom: 1px dashed var(--border);
  transition: color 0.15s, border-color 0.15s;

  &:hover {
    color: var(--primary);
    border-color: var(--primary);
  }
}

.release-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.release-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.release-card-date {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--text-muted);
}

.release-card-platforms {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
