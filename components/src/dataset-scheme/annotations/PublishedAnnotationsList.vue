<template>
  <ExpandableListTitle
    :title="$t('dataset_schema.published_annotations.title')"
    :dropdown-target-id="expandId"
    variant="inverted"
  />
  <div
    :id="expandId"
    class="annotation-body collapse"
    data-bs-parent="#togglePubannotationChild1"
  >
    <PublishedAnnotationBlock
      :aeg-id="annotationEditGroup.id"
      :as-property="asProperty"
      :is-auto-exportable="isAutoExportable"
      :has-paged-annotation-validations="hasPagedAnnotationValidations"
    />
    <PagedValidationBlock
      v-for="pagedValidation in pagedAnnotationValidations"
      :key="pagedValidation.id"
      :aeg-id="annotationEditGroup.id"
      :paged-validation="pagedValidation"
      :property-name="propertyName"
    />
    <FilterValidationBlock
      v-for="filterValidation in filterAnnotationValidations"
      :key="filterValidation.id"
      :aeg-id="annotationEditGroup.id"
      :filter-validation="filterValidation"
    />
  </div>
</template>

<script setup lang="ts">
import type { AnnotationEditGroup } from "@/types/annotation-edit-group.d.ts";
const props = defineProps<{
  annotationEditGroup: AnnotationEditGroup;
  propertyName?: string;
}>();

const expandId = computed(
  () => "pubannotation-" + props.annotationEditGroup.uuid
);

const asProperty = computed(() => props.annotationEditGroup.asProperty);
const isAutoExportable = computed(
  () => props.annotationEditGroup.autoexportable
);
const filterAnnotationValidations = computed(
  () => props.annotationEditGroup.filterAnnotationValidations
);
const pagedAnnotationValidations = computed(
  () => props.annotationEditGroup.pagedAnnotationValidations
);
const hasPagedAnnotationValidations = computed(
  () =>
    Array.isArray(pagedAnnotationValidations.value) &&
    pagedAnnotationValidations.value.length > 0
);
</script>
