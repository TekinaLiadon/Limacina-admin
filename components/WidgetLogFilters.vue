<template>
  <div class="logs-controls">
    <div class="form-group">
      <label for="log-date">Дата</label>
      <select id="log-date" :value="selectedDate" class="input" @change="$emit('update:selectedDate', ($event.target as HTMLSelectElement).value); $emit('dateChange')">
        <option v-for="d in dates" :key="d" :value="d">{{ d }}</option>
      </select>
    </div>

    <div class="form-group">
      <label for="log-level">Уровень</label>
      <select id="log-level" :value="levelFilter" class="input" @change="$emit('update:levelFilter', ($event.target as HTMLSelectElement).value)">
        <option value="">Все</option>
        <option value="10">Trace</option>
        <option value="20">Debug</option>
        <option value="30">Info</option>
        <option value="40">Warn</option>
        <option value="50">Error</option>
        <option value="60">Fatal</option>
      </select>
    </div>

    <div class="form-group search-group">
      <label for="log-search">Поиск</label>
      <input
        id="log-search"
        type="text"
        class="input"
        :value="search"
        placeholder="URL или сообщение"
        @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
      >
    </div>

    <div class="form-group">
      <label for="log-limit">На странице</label>
      <select id="log-limit" :value="limit" class="input" @change="$emit('update:limit', Number(($event.target as HTMLSelectElement).value)); $emit('limitChange')">
        <option :value="100">100</option>
        <option :value="250">250</option>
        <option :value="500">500</option>
        <option :value="1000">1000</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  dates: string[]
  selectedDate: string
  levelFilter: string
  search: string
  limit: number
}>()

defineEmits<{
  'update:selectedDate': [value: string]
  'update:levelFilter': [value: string]
  'update:search': [value: string]
  'update:limit': [value: number]
  dateChange: []
  limitChange: []
}>()
</script>

<style lang="scss" scoped>
@use '~/assets/css/mixins' as *;

.logs-controls {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;

  @include mobile {
    flex-direction: column;
  }

  .form-group {
    min-width: 160px;

    @include mobile {
      min-width: 0;
    }
  }

  .search-group {
    flex: 1;
  }
}
</style>
