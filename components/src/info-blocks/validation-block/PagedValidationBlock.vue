<template>
  <BaseAnnotationBlock
    :title="pagedValidation.name"
    :subtitle="$t('validation_item.paged_validations')"
    :execute-state="pagedValidation.executeState"
    :publish-state="pagedValidation.publishState"
  >
    <template #headerActionbar>
      <ul>
        <li>
          <MenuDropdown
            :id="`pav-${pagedValidation.id}`"
            :items="dropdownItems"
          >
            <template #icon> <i class="more orange"></i></template>
          </MenuDropdown>
        </li>
      </ul>
    </template>
    <template #content-top>
      <div class="validation-status-info">
        <ul>
          <li class="item-sorting-order">
            <div class="lbl">{{ $t("validation_item.sorting_order") }}</div>
            <div class="value">{{ itemSortingOrderText.sortingOrderText }}</div>
          </li>
          <li
            v-for="dim in itemSortingOrderText.dimensionsTexts"
            :key="dim.label"
          >
            <div class="lbl">
              {{ dim.label }}
            </div>
            <div class="value">{{ dim.value }}</div>
          </li>
        </ul>
        <div>
          <ul>
            <li v-if="pagedValidation.lifecycleState.state">
              <div class="lbl">{{ $t("state.lifecycle.title") }}</div>
              <div class="value">
                {{ pagedValidation.lifecycleState.state }}
              </div>
            </li>
            <li v-if="pagedValidation.lifecycleState.startedAt">
              <div class="lbl">{{ $t("state.started_at") }}</div>
              <div class="value">
                {{ formatTimestamp(pagedValidation.lifecycleState.startedAt) }}
              </div>
            </li>
            <li
              v-if="
                pagedValidation.lifecycleState.state !== 'STARTED' &&
                pagedValidation.lifecycleState.completedAt
              "
            >
              <div class="lbl">{{ $t("state.completed_at") }}</div>
              <div class="value">
                {{
                  formatTimestamp(pagedValidation.lifecycleState.completedAt)
                }}
              </div>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </BaseAnnotationBlock>
</template>

<script setup lang="ts">
import { usePagedValidationOptions } from "./usePagedValidationOptions";
import type { PagedValidation } from "@/types/paged-validation.d.ts";

const { extractValidationLabelsFromCode } = useValidationMode();

const props = defineProps<{
  aegId: string;
  pagedValidation: PagedValidation;
  propertyName?: string;
}>();

const pagedValidationRef = computed(() => props.pagedValidation);
const { dropdownItems } = usePagedValidationOptions(
  props.aegId,
  pagedValidationRef,
  props.propertyName
);

const itemSortingOrderText = computed(() => {
  const validationModeLabels = extractValidationLabelsFromCode(
    props.pagedValidation.mode
  );
  const sortingOrderText = validationModeLabels.label;
  const dimensionsTexts = validationModeLabels.dimensionsLabels;

  return {
    sortingOrderText,
    dimensionsTexts,
  };
});
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
