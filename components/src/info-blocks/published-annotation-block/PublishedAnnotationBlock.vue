<template>
  <BaseAnnotationBlock
    :title="
      asProperty || $t('dataset_schema.published_annotations.default_group')
    "
  >
    <template #headerSubtitle>
      <div class="form-check form-switch">
        <input
          id="annotation-published-checkbox"
          class="form-check-input"
          role="switch"
          type="checkbox"
          :checked="isAutoExportable"
          @change="handleToggleAutoExportable"
        />
        <label class="form-check-label" for="annotation-published-checkbox">
          {{ $t("dataset_schema.published_annotations.auto_exportable") }}
        </label>
      </div>
    </template>
    <template #headerActionbar>
      <ul>
        <li>
          <MenuDropdown
            :id="`published-annotation-${asProperty}`"
            :items="dropdownItems"
          >
            <template #icon>
              <i class="more orange"></i>
            </template>
          </MenuDropdown>
        </li>
      </ul>
    </template>
  </BaseAnnotationBlock>
</template>

<script setup lang="ts">
import { usePublishedAnnotationOptions } from "./usePublishedAnnotationOptions";
const { t } = useI18n();
const { toaster } = useToaster();

const props = defineProps<{
  aegId: string;
  asProperty?: string;
  isAutoExportable: boolean;
  hasPagedAnnotationValidations: boolean;
}>();

const { patchAnnotationEditGroup } = useAnnotationsStore();
const { dropdownItems } = usePublishedAnnotationOptions(
  props.aegId,
  props.hasPagedAnnotationValidations
);

const handleToggleAutoExportable = async (event: Event) => {
  const isAutoExportable = (event.target as HTMLInputElement).checked;

  try {
    await patchAnnotationEditGroup(props.aegId, {
      autoexportable: isAutoExportable,
    });
  } catch (err: any) {
    toaster.error(
      err?.value?.data?.message ||
        t("dataset_schema.published_annotations.toggle_auto_exportable.error")
    );
  }
};
</script>

<style lang="scss">
@import "@styles/variables.scss";

.form-switch {
  margin: 5px 0 0 4px;

  .form-check-input {
    font-size: 16px;
    position: relative;
    top: 3px;
    cursor: pointer;
  }
  .form-check-label {
    color: darken($accent-orange, 10%);
    opacity: 0.67;
    font-size: 12px;
    cursor: pointer;
  }
}
</style>
