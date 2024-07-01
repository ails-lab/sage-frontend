<template>
  <ActionSidebar
    id="offcanvasExportAnnotationsValidations"
    ref="exportAnnotationsValidationsRef"
  >
    <ActionSidebarHeader
      :title="$t('export_annotations_validations_sidebar.download_title')"
      :description="
        $t('export_annotations_validations_sidebar.download_description')
      "
      @close="$emit('close')"
    >
      <template #action>
        <ActionSidebarHeaderAction
          :aria-label="$t('code_sidebar.buttons.download')"
          @click="handleSave"
        >
          {{ $t("code_sidebar.buttons.download") }}
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

const { selectedValidation, deselectValidation } = useSelectedValidation();
const aegId = computed(() => selectedValidation.value?.aegId);

const { serializationOptions, archiveOptions, includeOptions } =
  useExportOptions();
const { exportAnnotationsValidations } = useAnnotationsStore();

const exportAnnotationsValidationsRef = ref();
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

const handleSave = async () => {
  if (!aegId.value) return;

  try {
    await exportAnnotationsValidations({
      aegId: aegId.value,
      options: { ...formValues.value },
    });

    toaster.success(t("export_annotations_validations_sidebar.success"));

    closeSidebar();
  } catch (err: any) {
    toaster.success(
      err?.value?.data?.message ||
        t("export_annotations_validations_sidebar.success")
    );
  }
};

const resetForm = () => {
  Object.keys(initialValues).forEach((key) => {
    formValues.value[key] = initialValues[key];
  });
};
const closeSidebar = () => {
  resetForm();
  emit("close");
  deselectValidation();
  hideOffcanvas(exportAnnotationsValidationsRef);
};
</script>
