<template>
  <div class="card">
    <h2 class="widget-title">Текущая версия</h2>
    <div v-if="version" class="version-info">
      <div class="version-row">
        <span class="config-label">Версия</span>
        <span>{{ version.version }}</span>
      </div>
      <div class="version-platforms">
        <a
          v-for="p in version.platforms"
          :key="`${p.os}-${p.arch}`"
          :href="getDownloadUrl(p.os, p.arch)"
          class="version-platform-card"
          target="_blank"
        >
          <span class="platform-label">{{ capitalize(p.os) }} {{ p.arch }}</span>
          <span class="platform-download">Скачать</span>
        </a>
      </div>
    </div>
    <div v-else class="empty-state padded">
      <p>Не удалось загрузить информацию о версии</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  version: any
  getDownloadUrl: (os: string, arch: string) => string
  capitalize: (s: string) => string
}>()
</script>

<style lang="scss" scoped>
@use '~/assets/css/mixins' as *;

.widget-title {
  font-size: 1rem;
  margin-bottom: 16px;
}

.card + .card {
  margin-top: 24px;
}

.padded {
  padding: 24px;
}

.version-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.version-row {
  display: flex;
  align-items: center;
  gap: 8px;
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
  transition: border-color 0.2s, background 0.2s;
  height: 44px;

  &:hover {
    border-color: var(--primary);
    background: var(--bg-hover);
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
}

.platform-download {
  opacity: 0;
  transform: translateY(12px);
}

.version-platform-card:hover .platform-label {
  opacity: 0;
  transform: translateY(-12px);
}

.version-platform-card:hover .platform-download {
  opacity: 1;
  transform: translateY(0);
  color: var(--primary);
  font-weight: 600;
  font-size: 0.875rem;
}
</style>
