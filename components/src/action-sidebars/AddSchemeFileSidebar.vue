<template>
  <ActionSidebar :id="`offcanvasAdd${type}File`" ref="addSchemeFileCanvas">
    <ActionSidebarHeader
      :title="sidebarTitle"
      :description="sidebardDescription"
      :close-label="$t('cancel')"
      @close="closeCanvas"
    >
      <template #action>
        <ActionSidebarHeaderAction
          :aria-label="$t('save')"
          @click="saveSchemeFile()"
        >
          {{ $t("save") }}
        </ActionSidebarHeaderAction>
      </template>
    </ActionSidebarHeader>
    <ActionSidebarBody>
      <div class="sage-form">
        <ActionFieldRow
          :label="$t('new_scheme_sidebar.name') + ' *'"
          :description="''"
        >
          <FormTextInput v-model="formValues.name" />
        </ActionFieldRow>
        <ActionFieldRow
          :label="$t('new_scheme_sidebar.description')"
          :description="''"
        >
          <FormTextInput v-model="formValues.description" :rows="2" />
        </ActionFieldRow>
        <ActionFieldRow :label="fileFieldLabel" description="">
          <div class="col">
            <div class="form-sublabel">Upload File</div>
            <FormFileInput
              v-model="formValues.file"
              class="space-bottom"
              name="file"
              :error="formErrotAt.file"
              accept=".ttl, .trig"
              @input="clearFormErrorAt('file')"
            />
            <div class="form-sublabel">or type a URL</div>
            <FormTextInput v-model="formValues.url" />
          </div>
        </ActionFieldRow>
        <div class="sage-form-info">
          <div class="notify">
            {{ $t("mandatory_field_explanation") }}
          </div>
        </div>
      </div>
    </ActionSidebarBody>
  </ActionSidebar>
</template>

<script setup lang="ts">
import type { SchemeType } from "~/types/Dataset";

const { t } = useI18n();
const { toaster } = useToaster();

const { $createSchemeFile, $updateSchemeFile } = useNuxtApp();
const { fetchMySchemes, selectNewScheme } = useSidebarDataStore();
const { selectedScheme } = storeToRefs(useSidebarDataStore());

const { selectedSchemeFile, deselectSchemeFile } = useSelectedSchemeFile();

const props = defineProps<{ type: SchemeType }>();

const formValues = ref<{
  file?: File;
  name: string;
  description: string;
  url?: string;
}>({ name: "", description: "", url: "" });
const formErrotAt = ref<{
  file?: string;
}>({});

const addSchemeFileCanvas = ref();

const editMode = computed(() => {
  return !!selectedSchemeFile.value?.id;
});
const sidebarTitle = computed(() => {
  return !editMode.value
    ? `Add ${props.type.toUpperCase()} File`
    : `Edit ${selectedSchemeFile.value?.name || "File"}`;
});
const sidebardDescription = computed(() => {
  return !editMode.value
    ? `Add ${props.type.toUpperCase()} File to ${selectedScheme.value.name}`
    : `Edit ${props.type.toUpperCase()} File in ${selectedScheme.value.name}`;
});
const fileFieldLabel = computed(() => {
  return !editMode.value
    ? t("new_scheme_sidebar.file") + " *"
    : t("new_scheme_sidebar.replace_file");
});

const clearFormErrorAt = (fieldName: keyof typeof formErrotAt.value) => {
  formErrotAt.value[fieldName] = "";
};

const resetInputValues = () => {
  formValues.value.name = "";
  formValues.value.description = "";
  formValues.value.file = undefined;
  formErrotAt.value.file = "";
};

const closeCanvas = () => {
  resetInputValues();
  deselectSchemeFile();
  hideOffcanvas(addSchemeFileCanvas);
};

const saveSchemeFile = async () => {
  const missingInput =
    formValues.value.name === "" ||
    (!formValues.value.file && formValues.value.url === "");
  if (missingInput && !editMode.value) {
    toaster.error(t("required_fields_error_msg"));
    return;
  }

  const formData = new FormData();
  let body = {
    name: formValues.value.name,
    ...(formValues.value.description?.length
      ? { description: formValues.value.description }
      : {}),
  };
  if (!editMode.value) {
    body = {
      ...body,
      ...{ type: props.type.toUpperCase() },
      ...(formValues.value.file ? {} : { url: formValues.value.url }),
    };
  }
  formData.append("json", JSON.stringify(body));
  if (formValues.value.file) {
    formData.append("file", formValues.value.file);
  }

  const { error }: any = !editMode.value
    ? await $createSchemeFile(selectedScheme.value.id, formData)
    : await $updateSchemeFile(selectedSchemeFile.value?.id || "", formData);

  if (error.value) {
    toaster.error(error.value.data.message);
    return;
  }
  await fetchMySchemes(props.type, 1);
  await selectNewScheme(selectedScheme.value.id, selectedScheme.value.scope);
  toaster.success(
    editMode.value
      ? t("new_scheme_sidebar.create_scheme_file_success", { item: props.type })
      : t("new_scheme_sidebar.edit_scheme_file_success", { item: props.type })
  );
  closeCanvas();
};

watch(selectedScheme, () => {
  if (selectedScheme.value.id) {
    closeCanvas();
  }
});
watch(selectedSchemeFile, () => {
  formValues.value.name = selectedSchemeFile.value?.name || "";
  formValues.value.description = selectedSchemeFile.value?.description || "";
});
</script>

<style scoped>
.error-paragraph {
  position: absolute;
  color: #f02849;
  font-size: 14px;
}
.space-bottom {
  margin-bottom: 20px;
}
</style>
