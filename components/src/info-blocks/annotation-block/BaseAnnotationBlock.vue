<template>
  <div class="base-annotation-block-body">
    <div class="base-annotation-block-header">
      <div class="row">
        <div class="col-9">
          <h5>{{ title }}</h5>
          <span v-if="!$slots.headerSubtitle" class="type">{{ subtitle }}</span>
          <slot v-else name="headerSubtitle" />
        </div>
        <div class="col actionbar">
          <slot name="headerActionbar" />
        </div>
      </div>
    </div>
    <div
      :class="`base-annotation-block-content ${
        !$slots['content-top'] ? 'no-content' : ''
      }`"
    >
      <slot name="content-top" />
      <StateBlock
        v-if="executeState"
        type="execute"
        :state="executeState"
        :classnames="{
          block: 'base-annotation-state-block',
          table: 'base-annotation-state-progress-table',
          label: 'base-annotation-state-labels',
        }"
      />
      <StateBlock
        v-if="publishState"
        type="publish"
        :state="publishState"
        :classnames="{
          block: 'base-annotation-state-block',
          label: 'base-annotation-state-labels',
        }"
      />
      <slot name="content-bottom" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExecuteState, PublishState } from "~/types/states";

defineProps<{
  title?: string;
  subtitle?: string;
  executeState?: ExecuteState;
  publishState?: PublishState;
}>();
</script>

<style lang="scss">
@import "@styles/mixin.scss";

.base-annotation-block-body {
  margin-top: 10px;
  border-radius: 20px;
  border: 1px solid $accent-orange;
  .base-annotation-block-header {
    @include assetHeader();
    background-color: transparent;

    h5,
    .type {
      color: darken($accent-orange, 10%);
    }

    .actionbar {
      text-align: right;

      li {
        padding: 0;
        list-style: none;
        display: inline-block;
        margin: 0 0 0 3px;
        &::after,
        &::before {
          display: none;
        }
        a {
          width: 35px;
          height: 35px;
          border-radius: 17.5px;
          display: inline-block;
          text-align: center;
          border: 1px solid $accent-orange;
          color: $accent-orange;
          &:hover {
            background-color: $accent-orange;
          }
          &:active {
            border-color: darken($accent-orange, 5%);
            background-color: darken($accent-orange, 5%);
          }
          &.show {
            background-color: $accent-orange;
          }
        }
      }
    }
  }
}
.base-annotation-block-content {
  padding: 15px 0px 0px 0px;
  border-top: 1px solid $accent-orange;

  > * {
    padding-left: 20px;
    padding-right: 20px;
  }
  &.no-content {
    padding-top: 0;
    border: 0;
  }
}

.base-annotation-state-block {
  border-top: 1px solid rgba($accent-orange, 0.5);
  .base-annotation-state-progress-table {
    th {
      // color: darken($accent-orange, 10%);
      opacity: 0.67;
    }
    th,
    td {
      // color: darken($accent-orange, 10%);
      opacity: 0.67;
      background-color: darken($accent-third-color, 2%);
    }
  }
}
.base-annotation-state-labels {
  color: darken($accent-orange, 10%);
}
</style>
