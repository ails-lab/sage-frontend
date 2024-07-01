<template>
  <ActionSidebar
    id="offcanvasAttachSourceDataFile"
    ref="attachSourceDataFileSidebarRef"
  >
    <ActionSidebarHeader
      :title="$t('attach_source_data_file_sidebar.title')"
      :description="$t('attach_source_data_file_sidebar.description')"
      :close-label="$t('cancel')"
      @close="closeSidebar()"
    >
      <template #action>
        <ActionSidebarHeaderAction
          href="#"
          :aria-label="$t('save')"
          @click="handleSubmit"
        >
          {{ $t("save") }}
        </ActionSidebarHeaderAction>
      </template>
    </ActionSidebarHeader>
    <ActionSidebarBody>
      <div class="sage-form">
        <ActionFieldRow
          :label="$t('attach_source_data_file_sidebar.source_data_file.label')"
          :description="
            $t('attach_source_data_file_sidebar.source_data_file.description')
          "
        >
          <FormFileInput
            v-model="formValues.file"
            name="file"
            :error="formErrotAt.file"
            accept=".ttl, .trig"
            @input="clearFormErrorAt('file')"
          />
        </ActionFieldRow>
      </div>
    </ActionSidebarBody>
  </ActionSidebar>
</template>

<script setup lang="ts">
const { t } = useI18n();
const { toaster } = useToaster();

const { selectedDataset } = storeToRefs(useSidebarDataStore());
const { selectNewDataset } = useSidebarDataStore();
const { $mappingApi } = useNuxtApp();

const attachSourceDataFileSidebarRef = ref();

const { selectedMapping, deselectMapping } = useSelectedMapping();
const instanceId = computed(() => selectedMapping.value?.instance?.id);
const mappingId = computed(() => selectedMapping.value?.mapping.id);

const formValues = ref<{
  file?: File;
}>({});

const formErrotAt = ref<{
  file?: string;
}>({});

const handleSubmit = async () => {
  if (!mappingId.value) {
    return;
  }
  if (!formValidation()) {
    return;
  }

  const formdata = new FormData();
  if (formValues.value.file) {
    formdata.append("file", formValues.value.file);
  }

  const { error }: any = await $mappingApi.attachSourceDataFile(
    mappingId.value,
    formdata,
    instanceId.value
  );
  if (error.value) {
    toaster.error(
      error.value?.data?.message ||
        t("attach_source_data_file_sidebar.error_creating")
    );
  } else {
    toaster.success(t("attach_source_data_file_sidebar.success_creating"));
    await selectNewDataset(selectedDataset.value.id);
    closeSidebar();
  }
};

const formValidation = () => {
  if (!formValues.value.file) {
    formErrotAt.value.file = t(
      "attach_source_data_file_sidebar.source_data_file.error"
    );
    return false;
  }
  return true;
};

const clearFormErrorAt = (fieldName: keyof typeof formErrotAt.value) => {
  formErrotAt.value[fieldName] = "";
};

const resetForm = () => {
  formValues.value.file = undefined;
  formErrotAt.value.file = "";
};

const closeSidebar = () => {
  resetForm();
  deselectMapping();
  hideOffcanvas(attachSourceDataFileSidebarRef);
};
</script>
