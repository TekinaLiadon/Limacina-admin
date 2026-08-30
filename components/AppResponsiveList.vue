<template>
  <div class="card table-wrap desktop-table">
    <table>
      <thead>
        <tr>
          <th v-for="column in columns" :key="column">
            <slot name="column" :column="column">{{ column }}</slot>
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(item, index) in items" :key="keyOf(item, index)">
          <slot name="row" :item="item" :index="index" />
        </template>
      </tbody>
    </table>
  </div>

  <div class="mobile-cards">
    <template v-for="(item, index) in items" :key="keyOf(item, index)">
      <slot name="card" :item="item" :index="index" />
    </template>
  </div>
</template>

<script setup lang="ts" generic="T">
const props = defineProps<{
  items: T[]
  columns: string[]
  itemKey?: (item: T, index: number) => string | number
}>()

const keyOf = (item: T, index: number): string | number =>
  props.itemKey ? props.itemKey(item, index) : index
</script>
