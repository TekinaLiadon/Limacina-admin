<template>
  <div class="logs-controls">
    <div class="form-group">
      <label for="log-date">Дата</label>
      <select id="log-date" :value="selectedDate" class="input" @change="$emit('update:selectedDate', ($event.target as HTMLSelectElement).value); $emit('dateChange')">
        <option v-for="d in dates" :key="d" :value="d">{{ d }}</option>
      </select>
    </div>

    <div class="form-group">
      <label for="log-status">Код ответа</label>
      <select id="log-status" :value="statusCode" class="input" @change="$emit('update:statusCode', ($event.target as HTMLSelectElement).value)">
        <option value="">Все</option>
        <option v-for="code in STATUS_CODES" :key="code" :value="String(code)">{{ code }}</option>
      </select>
    </div>

    <div class="form-group filter-group">
      <label for="log-url">URL</label>
      <input
        id="log-url"
        type="text"
        class="input"
        :value="url"
        placeholder="/v1/common/auth"
        @input="$emit('update:url', ($event.target as HTMLInputElement).value)"
      >
    </div>

    <div class="form-group filter-group">
      <label for="log-ip">IP</label>
      <input
        id="log-ip"
        type="text"
        class="input"
        :value="ip"
        placeholder="127.0.0.1"
        @input="$emit('update:ip', ($event.target as HTMLInputElement).value)"
      >
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
const STATUS_CODES = [200, 201, 204, 400, 401, 403, 404, 409, 429, 500, 502, 503]

defineProps<{
  dates: string[]
  selectedDate: string
  statusCode: string
  url: string
  ip: string
  levelFilter: string
  limit: number
}>()

defineEmits<{
  'update:selectedDate': [value: string]
  'update:statusCode': [value: string]
  'update:url': [value: string]
  'update:ip': [value: string]
  'update:levelFilter': [value: string]
  'update:limit': [value: number]
  dateChange: []
  limitChange: []
}>()
</script>

<style lang="scss" scoped>
@use '~/assets/css/mixins' as *;

.logs-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;

  @include mobile {
    flex-direction: column;
  }

  .form-group {
    min-width: 160px;

    @include mobile {
      min-width: 0;
      width: 100%;
    }
  }

  .filter-group {
    flex: 1;
    min-width: 200px;
  }
}
</style>
