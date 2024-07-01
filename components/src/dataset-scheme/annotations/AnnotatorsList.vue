<template>
  <ExpandableListTitle
    :title="$t('dataset_schema.annotators_list.title')"
    :dropdown-target-id="expandId"
  />
  <div
    :id="expandId"
    class="collapse"
    data-bs-parent="#togglePubannotationChild1"
  >
    <AnnotatorBlock
      v-for="annotator in annotators"
      :key="annotator.id"
      :annotator="annotator"
      :is-publishable="!shouldDisablePublishOptions"
    />
  </div>
</template>

<script setup lang="ts">
import type { Annotator } from "~/types/Annotator";
import type { PagedValidation } from "~/types/paged-validation";

defineEmits(["newValidation", "exportAnnotations"]);
const props = defineProps<{
  annotators: Annotator[];
  pagedValidations?: PagedValidation[];
}>();

const shouldDisablePublishOptions = computed(() =>
  props.pagedValidations?.find((v) => v.lifecycleState.state === "STARTED")
);

const expandId = ref("annotators-" + Math.random().toString(36).substring(7));
</script>

<style lang="scss" scoped></style>
