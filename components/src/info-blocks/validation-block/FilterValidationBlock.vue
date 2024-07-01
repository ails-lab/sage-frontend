<template>
  <BaseAnnotationBlock
    :title="filterValidation.name"
    :subtitle="$t('validation_item.filter_validations')"
    :execute-state="filterValidation.executeState"
    :publish-state="filterValidation.publishState"
  >
    <template #headerActionbar>
      <ul>
        <li>
          <MenuDropdown
            :id="`pav-${filterValidation.id}`"
            :items="dropdownItems"
          >
            <template #icon> <i class="more orange"></i></template>
          </MenuDropdown>
        </li>
      </ul>
    </template>
    <template #content-top>
      <div v-if="filterValidation.createdAt" class="validation-status-info">
        <ul>
          <li class="execution-status">
            <div class="lbl">{{ $t("state.created_at") }}</div>
            <div class="value">
              {{ formatTimestamp(filterValidation.createdAt) }}
            </div>
          </li>
        </ul>
      </div>
    </template>
  </BaseAnnotationBlock>
</template>

<script setup lang="ts">
import { useFilterValidationOptions } from "./useFilterValidationOptions";
import type { FilterValidation } from "@/types/filter-validation.d.ts";

const props = defineProps<{
  aegId: string;
  filterValidation: FilterValidation;
}>();

const filterValidationRef = computed(() => props.filterValidation);
const { dropdownItems } = useFilterValidationOptions(
  props.aegId,
  filterValidationRef
);
</script>

<style lang="scss">
@import "@styles/mixin.scss";

.validation-status-info {
  .lbl {
    font-size: 11px;
    color: darken($accent-orange, 10%);
    opacity: 0.67;
    text-transform: uppercase;
  }
  .value {
    text-wrap: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    color: darken($accent-orange, 10%);
    a {
      color: darken($accent-orange, 10%);
      text-decoration: underline;
    }
    span.exp {
      display: inline-block;
      padding: 0 7px;
      border-radius: 3px;
      margin-left: 5px;
      background-color: $accent-third-color;
    }
  }
  a.toggle {
    @include toggleDesign;
    .txt {
      margin-left: 0px;
      border: 0;
      color: #fff;
    }
  }
  ul {
    margin: 0;
    padding: 0;
    @include clearfix();

    li {
      display: inline-block;
      list-style: none;
      margin-right: 30px;
      margin-bottom: 10px;

      &.execution-status {
        min-width: 130px;
      }

      &.item-sorting-order {
        max-width: 200px;
      }
    }
  }
}
</style>
