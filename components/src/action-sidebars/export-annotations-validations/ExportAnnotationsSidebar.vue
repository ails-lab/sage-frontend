<template>
  <ActionSidebar id="offcanvasExportAnnotations" ref="exportAnnotationsRef">
    <ActionSidebarHeader
      :title="$t('export_annotations_validations_sidebar.export_title')"
      :description="
        $t('export_annotations_validations_sidebar.export_description')
      "
      @close="$emit('close')"
    >
      <template #action>
        <ActionSidebarHeaderAction
          :aria-label="$t('code_sidebar.buttons.copy_link')"
          @click="handleCopy"
        >
          {{ $t("code_sidebar.buttons.copy_link") }}
        </ActionSidebarHeaderAction>
      </template>
    </ActionSidebarHeader>
    <ActionSidebarBody>
      <div class="sage-form">
        <ActionFieldRow
          :label="
            $t('export_annotations_validations_sidebar.serialization.label')
          "
          :description="
            $t(
              'export_annotations_validations_sidebar.serialization.description'
            )
          "
        >
          <FormSelectInput
            v-model="formValues.serialization"
            :options="serializationOptions"
          />
        </ActionFieldRow>
        <ActionFieldRow
          :label="$t('export_annotations_validations_sidebar.include.label')"
          :description="
            $t('export_annotations_validations_sidebar.include.description')
          "
        >
          <FormCheckboxInput
            v-for="option in includeOptions"
            :key="option.key"
            v-model="formValues[option.key]"
            :label="option.label"
          />
        </ActionFieldRow>
        <ActionFieldRow
          :label="$t('export_annotations_validations_sidebar.archive.label')"
          :description="
            $t('export_annotations_validations_sidebar.archive.description')
          "
        >
          <FormSelectInput
            v-model="formValues.archive"
            :options="archiveOptions"
          />
        </ActionFieldRow>
      </div>
    </ActionSidebarBody>
  </ActionSidebar>
</template>

<script setup lang="ts">
import { useExportOptions } from "./useExportOptions";
const { t } = useI18n();
const { toaster } = useToaster();

const emit = defineEmits(["close"]);

const { serializationOptions, archiveOptions, includeOptions } =
  useExportOptions();
const { copyExportAnnotationsLinkToClipboard } = useAnnotationsStore();
const { selectedDataset } = storeToRefs(useSidebarDataStore());

const initialValues: {
  serialization: string;
  archive: string;
  [key: string]: string | boolean;
} = {
  serialization: serializationOptions[0].value,
  archive: archiveOptions[0].value,
  ...Object.fromEntries(
    includeOptions.map(({ key, defaultValue }) => [key, defaultValue])
  ),
};

const formValues = ref({ ...initialValues });

const handleCopy = () => {
  copyExportAnnotationsLinkToClipboard({
    datasetUuid: selectedDataset.value.uuid,
    options: { ...formValues.value },
  });
  toaster.success(t("export_annotations_validations_sidebar.link_copied"));
  closeSidebar();
};

const exportAnnotationsRef = ref();
const closeSidebar = () => {
  emit("close");
  hideOffcanvas(exportAnnotationsRef);
};
</script>
