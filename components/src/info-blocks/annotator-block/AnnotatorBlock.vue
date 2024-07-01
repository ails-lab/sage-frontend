<template>
  <BaseAnnotationBlock
    :title="annotator.name"
    :subtitle="subHeader"
    :execute-state="annotator.executeState"
    :publish-state="annotator.publishState"
  >
    <template #headerActionbar>
      <ul>
        <li>
          <MenuDropdown :id="`pav-${annotator.id}`" :items="dropdownOptions">
            <template #icon> <i class="more orange"></i></template>
          </MenuDropdown>
        </li>
      </ul>
    </template>
  </BaseAnnotationBlock>
</template>

<script setup lang="ts">
import { useAnnotatorOptions } from "./useAnnotatorOptions";
import type { Annotator } from "~/types/Annotator";

const { t } = useI18n();

const props = defineProps<{
  annotator: Annotator;
  isPublishable: boolean;
}>();

const annotatorRef = computed(() => props.annotator);
const isNotPublishable = computed(() => !props.isPublishable);
const { dropdownOptions } = useAnnotatorOptions(annotatorRef, isNotPublishable);

const subHeader = computed(
  () =>
    t("annotator_item.annotator_type", {
      type: props.annotator.annotator || "N/A",
    }) +
    (props.annotator.variant
      ? " | " + props.annotator.variant
      : ""
    ).toUpperCase()
);
</script>
