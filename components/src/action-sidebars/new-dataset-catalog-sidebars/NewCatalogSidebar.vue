<template>
  <ActionSidebar :id="`offcanvasNewCatalog`" ref="catalogCanvas">
    <ActionSidebarHeader
      :title="`${
        !editDatasetClicked
          ? $t('new_dataset_catalog_sidebar.new')
          : $t('new_dataset_catalog_sidebar.edit')
      } Catalog`"
      :description="$t(propertyToken('description'))"
      :close-label="$t('cancel')"
      @close="editDatasetClicked = false"
    >
      <template #action>
        <ActionSidebarHeaderAction
          :aria-label="$t('save')"
          @click="saveCatalog"
        >
          {{ $t("save") }}
        </ActionSidebarHeaderAction>
      </template>
    </ActionSidebarHeader>
    <ActionSidebarBody>
      <div class="sage-form">
        <ActionFieldRow
          :label="$t(propertyToken('name')) + ' *'"
          :description="
            $t('new_dataset_catalog_sidebar.catalog_name_description')
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
const { fetchMyCatalogs, selectNewDataset } = useSidebarDataStore();

const { $createNewCatalog, $editCatalog, $validateIdentifier } = useNuxtApp();

const { identifierError, validateIdentifier } = useIdentifierValidation();

const initialValues: {
  name?: string;
  visibility?: string;
  identifier?: string;
} = {};
const formValues = ref({ ...initialValues });

const catalogCanvas = ref();

watch(editDatasetClicked, () => {
  if (editDatasetClicked.value) {
    formValues.value.identifier = selectedDataset.value.identifier ?? "";
    formValues.value.name = selectedDataset.value.name;
    formValues.value.visibility = selectedDataset.value.public
      ? "public"
      : "private";
  } else {
    formValues.value.identifier = "";
    formValues.value.name = "";
    formValues.value.visibility = "";
  }
});

const propertyToken = (property: String) => {
  return `new_dataset_catalog_sidebar.catalog_${property}`;
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

const saveCatalog = () => {
  if (!formValues.value.name || !formValues.value.visibility) {
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
  const { error }: any = await $createNewCatalog(
    formValues.value.name as string,
    formValues.value.identifier as string,
    formValues.value.visibility === "public"
  );
  await fetchMyCatalogs(1);

  if (error.value) {
    toaster.error(error.value.data.message);
    return;
  }
  closeSidebar("Catalog created successfully.");
};

const updateDataset = async () => {
  const { error }: any = await $editCatalog(
    selectedDataset.value.id,
    formValues.value.name as string,
    formValues.value.identifier as string,
    formValues.value.visibility === "public"
  );

  if (error.value) {
    toaster.error(error.value.data.message);
    return;
  }

  selectNewDataset(selectedDataset.value.id).catch((error) =>
    console.error(error)
  );
  await fetchMyCatalogs(1);

  closeSidebar("Catalog updated successfully.");
};

const resetForm = () => {
  formValues.value = { ...initialValues };
};

const closeSidebar = (message: string) => {
  resetForm();
  editDatasetClicked.value = false;
  toaster.success(message);
  hideOffcanvas(catalogCanvas);
};
</script>
