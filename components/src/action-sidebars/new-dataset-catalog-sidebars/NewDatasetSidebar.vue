<template>
  <ActionSidebar :id="`offcanvasNewDataset`" ref="datasetCanvas">
    <ActionSidebarHeader
      :title="`${
        !editDatasetClicked
          ? $t('new_dataset_catalog_sidebar.new')
          : $t('new_dataset_catalog_sidebar.edit')
      } Dataset`"
      :description="$t(propertyToken('description'))"
      :close-label="$t('cancel')"
      @close="editDatasetClicked = false"
    >
      <template #action>
        <ActionSidebarHeaderAction
          :aria-label="$t('save')"
          @click="saveDataset"
        >
          {{ $t("save") }}
        </ActionSidebarHeaderAction>
      </template>
    </ActionSidebarHeader>
    <ActionSidebarBody>
      <div class="sage-form">
        <ActionFieldRow
          :label="$t(propertyToken('type')) + ' *'"
          :description="
            $t('new_dataset_catalog_sidebar.dataset_type_description')
          "
        >
          <FormSelectInput
            v-model="formValues.scope"
            :options="[
              {
                value: 'COLLECTION',
                label: $t(propertyToken('type_collection')),
              },
              {
                value: 'VOCABULARY',
                label: $t(propertyToken('type_vocabulary')),
              },
              {
                value: 'ALIGNMENT',
                label: $t(propertyToken('type_alignment')),
                disabled: true,
                hidden: useRuntimeConfig().public.ai4cultureDeployment
                  ? true
                  : false,
              },
            ]"
          />
        </ActionFieldRow>
        <ActionFieldRow
          :label="$t(propertyToken('name')) + ' *'"
          :description="
            $t('new_dataset_catalog_sidebar.dataset_name_description')
          "
        >
          <FormTextInput v-model="formValues.name" />
        </ActionFieldRow>
        <ActionFieldRow
          :label="$t('new_dataset_catalog_sidebar.identifier')"
          :description="
            $t('new_dataset_catalog_sidebar.identifier_description')
          "
        >
          <FormTextInput
            v-model="formValues.identifier"
            :error="identifierError?.message"
            @input="handleIdentifierChange"
          />
        </ActionFieldRow>
        <ActionFieldRow
          v-if="!useRuntimeConfig().public.ai4cultureDeployment"
          :label="$t('new_dataset_catalog_sidebar.visibility') + ' *'"
          :description="
            $t('new_dataset_catalog_sidebar.visibility_description')
          "
        >
          <FormSelectInput
            v-model="formValues.visibility"
            :options="[
              {
                value: 'private',
                label: $t('new_dataset_catalog_sidebar.private'),
              },
              {
                value: 'public',
                label: $t('new_dataset_catalog_sidebar.public'),
              },
            ]"
          />
        </ActionFieldRow>
        <ActionFieldRow
          v-if="!useRuntimeConfig().public.ai4cultureDeployment"
          :label="$t('new_dataset_catalog_sidebar.location') + ' *'"
          :description="$t('new_dataset_catalog_sidebar.location_description')"
        >
          <FormSelectInput
            v-model="formValues.location"
            :options="[
              {
                value: 'LOCAL',
                label: $t('new_dataset_catalog_sidebar.local'),
              },
              {
                value: 'REMOTE',
                label: $t('new_dataset_catalog_sidebar.remote'),
                disabled: true,
              },
            ]"
        /></ActionFieldRow>
      </div>
      <!-- form info-->
      <div class="sage-form-info">
        <div class="notify">
          {{ $t("mandatory_field_explanation") }}
        </div>
      </div>
    </ActionSidebarBody>
  </ActionSidebar>
</template>

<script setup lang="ts">
import { useIdentifierValidation } from "../composables/useIdentifierValidation";

const { t } = useI18n();
const { toaster } = useToaster();

const { editDatasetClicked, selectedDataset } = storeToRefs(
  useSidebarDataStore()
);
const { fetchMyDatasets, selectNewDataset } = useSidebarDataStore();

const { $createNewDataset, $editDataset, $validateIdentifier } = useNuxtApp();

const { identifierError, validateIdentifier } = useIdentifierValidation();

const initialValues: {
  name?: string;
  visibility?: string;
  scope?: string;
  identifier?: string;
  location: string;
} = {
  location: "LOCAL",
  visibility: useRuntimeConfig().public.ai4cultureDeployment ? "public" : "",
};
const formValues = ref({ ...initialValues });

const datasetCanvas = ref();

watch(editDatasetClicked, () => {
  if (editDatasetClicked.value) {
    formValues.value.scope = selectedDataset.value.scope;
    formValues.value.identifier = selectedDataset.value.identifier ?? "";
    formValues.value.name = selectedDataset.value.name;
    formValues.value.visibility = selectedDataset.value.public
      ? "public"
      : "private";
  } else {
    formValues.value.scope = "";
    formValues.value.identifier = "";
    formValues.value.name = "";
    formValues.value.visibility = useRuntimeConfig().public.ai4cultureDeployment
      ? "public"
      : "";
  }
});

const propertyToken = (property: String) => {
  return `new_dataset_catalog_sidebar.dataset_${property}`;
};

const handleIdentifierChange = debounce(() => {
  if (
    editDatasetClicked.value &&
    formValues.value.identifier === selectedDataset.value.identifier
  ) {
    identifierError.value = undefined;
    return;
  }
  validateIdentifier(
    $validateIdentifier,
    t("new_dataset_catalog_sidebar.identifier_error_exists"),
    t("new_dataset_catalog_sidebar.identifier_error_invalid"),
    formValues.value.identifier
  );
});

const saveDataset = () => {
  if (
    !formValues.value.name ||
    !formValues.value.visibility ||
    !formValues.value.scope ||
    !formValues.value.location
  ) {
    toaster.error(
      "Fill all the required fields. They are indicated by * next to the field name."
    );
    return;
  }
  if (identifierError.value) {
    toaster.error(identifierError.value.message);

    return;
  }

  if (editDatasetClicked.value) {
    updateDataset();
  } else {
    createDataset();
  }
};

const createDataset = async () => {
  const { error }: any = await $createNewDataset(
    formValues.value.name as string,
    formValues.value.identifier as string,
    formValues.value.visibility === "public",
    formValues.value.scope as string,
    formValues.value.location
  );
  await fetchMyDatasets(1);

  if (error.value) {
    toaster.error(error.value.data.message);
    return;
  }
  closeSidebar("Dataset created successfully.");
};

const updateDataset = async () => {
  const { error }: any = await $editDataset(
    selectedDataset.value.id,
    formValues.value.name as string,
    formValues.value.identifier as string,
    formValues.value.visibility === "public",
    formValues.value.scope as string,
    formValues.value.location
  );

  if (error.value) {
    toaster.error(error.value.data.message);
    return;
  }

  selectNewDataset(selectedDataset.value.id).catch((error) =>
    console.error(error)
  );
  await fetchMyDatasets(1);

  closeSidebar("Dataset updated successfully.");
};

const resetForm = () => {
  formValues.value = { ...initialValues };
};

const closeSidebar = (message: string) => {
  resetForm();

  editDatasetClicked.value = false;

  toaster.success(message);

  hideOffcanvas(datasetCanvas);
};
</script>
