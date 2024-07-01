<template>
  <table :class="['table', $style['progress-table'], classname || '']">
    <thead>
      <tr>
        <th>{{ $t("mapping_item.progress.mapping") }}</th>
        <th>{{ $t("mapping_item.progress.total") }}</th>
        <th>{{ $t("mapping_item.progress.failed") }}</th>
        <th>{{ $t("mapping_item.progress.status") }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(entry, index) of progress" :key="index">
        <td>
          {{ formatName(entry) }}
        </td>
        <td>
          {{ entry.totalCount.toLocaleString("en-US") }}
        </td>
        <td>
          {{ entry.failures.toLocaleString("en-US") }}
        </td>
        <td>
          {{ entryStatus(entry) }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import type { StateProgress } from "~/types/states/state-progress";
const { t } = useI18n();

defineProps<{ progress: StateProgress[]; classname?: string }>();

const entryStatus = (entry: StateProgress) => {
  if (!entry.started) {
    return t("mapping_item.progress.not_started");
  } else if (entry.failed) {
    return t("mapping_item.progress.failed");
  } else if (entry.completed) {
    return t("mapping_item.progress.completed");
  } else {
    return t("mapping_item.progress.in_progress");
  }
};

const formatName = (entry: StateProgress) => {
  return entry.triplesMap.split("/").slice(-1)[0].split("#").slice(-1)[0];
};
</script>

<style lang="scss" module>
@import "@styles/variables.scss";

.progress-table {
  margin-bottom: 0;
  width: auto;
  // background-color: #869fbb;
  td,
  th {
    padding: 0 32px 0 8px !important;
    border: 0;
    &:last-of-type {
      padding-right: 8px !important;
    }
  }
  th {
    font-size: 11px;
    color: $text-second-color;
    text-transform: uppercase;
    font-weight: normal;
  }
}
</style>
