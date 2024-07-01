<template>
  <ActionSidebar id="offcanvasAddMappingInstance" ref="addMappinInstanceCanvas">
    <ActionSidebarHeader
      :title="$t('add_mapping_instance_sidebar.title')"
      :description="
        $t('add_mapping_instance_sidebar.description', { name: mapping?.name })
      "
      :close-label="$t('cancel')"
      @close="closeSidebar"
    >
      <template #action>
        <ActionSidebarHeaderAction
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
          v-if="!useRuntimeConfig().public.ai4cultureDeployment"
          :label="$t('add_mapping_instance_sidebar.identifier')"
          :description="
            $t('add_mapping_instance_sidebar.identifier_description')
          "
        >
          <FormTextInput
            v-model="formValues.identifier"
            :error="identifierError?.message"
            @input="handleIdentifierChange"
          />
        </ActionFieldRow>
        <ActionFieldRow
          :label="$t('add_mapping_instance_sidebar.field_row.title')"
          :description="
            $t('add_mapping_instance_sidebar.field_row.description')
          "
        >
          <FormTextInput
            v-for="param in mapping?.parameters"
            :key="param.name"
            v-model="formValues[param.name]"
            :name="param.name"
            :label="getParameterLabel(param)"
            :error="formErrorAt[param.name]"
            @input="clearFormErrorAt(param.name)"
          />
          <FormCheckboxInput
            v-if="!useRuntimeConfig().public.ai4cultureDeployment"
            v-model="formValues.active"
            name="active"
            :label="$t('add_mapping_instance_sidebar.active_label')"
          />
        </ActionFieldRow>
      </div>
    </ActionSidebarBody>
  </ActionSidebar>
</template>

<script setup lang="ts">
import { useIdentifierValidation } from "./composables/useIdentifierValidation";
import type { MappingParameter } from "~/types/Mapping";

const { t } = useI18n();
const { toaster } = useToaster();

const { $mappingApi } = useNuxtApp();
const { selectedDataset } = storeToRefs(useSidebarDataStore());
const { selectNewDataset } = useSidebarDataStore();
const { identifierError, validateIdentifier } = useIdentifierValidation();

const emit = defineEmits(["close"]);

const { selectedMapping, deselectMapping } = useSelectedMapping();
const instance = computed(() => selectedMapping.value?.instance);
const mapping = computed(() => selectedMapping.value?.mapping);
const addMappinInstanceCanvas = ref();

const formValues = ref<{ [key: string]: any }>({
  active: true,
  identifier: "",
});
const formErrorAt = ref<{ [key: string]: any }>({});

// If editing an Instance, pre-populate the form with the instance's values
watch(
  () => instance.value,
  (editingInstance) => {
    if (!editingInstance?.id) {
      formValues.value.identifier = "";
      return;
    }
    formValues.value.active = editingInstance.active;
    formValues.value.identifier = editingInstance.identifier ?? "";
    editingInstance.binding?.forEach((binding) => {
      formValues.value[binding.name] = binding.value;
    });
  },
  { immediate: true }
);

const formValidation = () => {
  if (identifierError.value) {
    toaster.error(identifierError.value.message);
    return false;
  }
  let isValid = true;
  mapping.value?.parameters.forEach((param) => {
    if (param.required && !formValues.value[param.name]) {
      formErrorAt.value[param.name] = t(
        "add_mapping_instance_sidebar.error.required",
        { field: param.name }
      );
      isValid = false;
    }
  });

  return isValid;
};

const resetForm = () => {
  formValues.value = { active: true, identifier: "" };

  Object.keys(formErrorAt.value).forEach(
    (key) => delete formErrorAt.value[key]
  );
};

const handleIdentifierChange = debounce(() => {
  if (
    instance.value?.id &&
    formValues.value.identifier === instance.value?.identifier
  ) {
    identifierError.value = undefined;
    return;
  }
  validateIdentifier(
    $mappingApi.validateIdentifier,
    t("new_dataset_catalog_sidebar.identifier_error_exists"),
    t("new_dataset_catalog_sidebar.identifier_error_invalid"),
    formValues.value.identifier,
    {
      datasetId: selectedDataset.value.id,
      mappingId: mapping.value?.id,
    }
  );
});

const getParameterLabel = (param: MappingParameter): string => {
  if (!param.required) return `(OPTIONAL) ${param.name}`;
  return param.name;
};

const handleSubmit = async () => {
  if (!mapping.value?.id) {
    return;
  }
  if (!formValidation()) {
    return;
  }

  const { active, ...bindingValues } = formValues.value;
  const payload: { [key: string]: any } = {
    bindings: Object.entries(bindingValues).map(([name, value]) => ({
      name,
      value,
    })),
    active,
  };
  if (formValues.value.identifier) {
    payload.identifier = formValues.value.identifier;
  }
  if (instance.value?.id) {
    const { error }: any = await $mappingApi.updateMappingInstance(
      mapping.value.id,
      instance.value.id,
      payload
    );

    if (error.value) {
      toaster.error(t("add_mapping_instance_sidebar.error.updating"));
    } else {
      toaster.success(t("add_mapping_instance_sidebar.success.updating"));
      await selectNewDataset(selectedDataset.value.id);
      closeSidebar();
    }
  } else {
    const { error }: any = await $mappingApi.createMappingInstance(
      mapping.value.id,
      payload
    );

    if (error.value) {
      toaster.error(t("add_mapping_instance_sidebar.error.creating"));
    } else {
      toaster.success(t("add_mapping_instance_sidebar.success.creating"));
      await selectNewDataset(selectedDataset.value.id);
      closeSidebar();
    }
  }
};

const clearFormErrorAt = (fieldName: string) => {
  formErrorAt.value[fieldName] = "";
};

const closeSidebar = () => {
  resetForm();
  emit("close");
  deselectMapping();
  hideOffcanvas(addMappinInstanceCanvas);
};
</script>
