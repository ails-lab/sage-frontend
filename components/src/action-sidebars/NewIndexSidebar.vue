<template>
  <ActionSidebar id="offcanvasNewindex" ref="newIndexCanvas">
    <ActionSidebarHeader
      :title="$t('add_index_sidebar.title')"
      :description="$t('add_index_sidebar.description')"
      :close-label="$t('cancel')"
      @close="closeCanvas"
    >
      <template #action>
        <ActionSidebarHeaderAction :aria-label="$t('save')" @click="saveIndex">
          {{ $t("save") }}
        </ActionSidebarHeaderAction>
      </template>
    </ActionSidebarHeader>
    <ActionSidebarBody>
      <div class="sage-form">
        <ActionFieldRow
          :label="$t('add_index_sidebar.name') + ' *'"
          :description="$t('add_index_sidebar.name_description')"
        >
          <FormTextInput v-model="name" />
        </ActionFieldRow>
        <ActionFieldRow
          :label="$t('add_index_sidebar.identifier')"
          :description="$t('add_index_sidebar.identifier_description')"
        >
          <FormTextInput
            v-model="identifier"
            :error="identifierError?.message"
            @input="handleIdentifierChange"
          />
        </ActionFieldRow>
        <ActionFieldRow
          :label="$t('add_index_sidebar.visibility') + ' *'"
          :description="$t('add_index_sidebar.visibility_description')"
        >
          <FormSelectInput
            v-model="visibility"
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
        <div class="notify">{{ $t("mandatory_field_explanation") }}</div>
      </div>
    </ActionSidebarBody>
  </ActionSidebar>
</template>

<script setup lang="ts">
import { useIdentifierValidation } from "./composables/useIdentifierValidation";

const { t } = useI18n();
const { identifierError, validateIdentifier } = useIdentifierValidation();

const { toaster } = useToaster();

const { editIndexClicked, selectedDataset, selectedIndex } = storeToRefs(
  useSidebarDataStore()
);
const { $createNewScheme, $editScheme, $validateIdentifier } = useNuxtApp();
const visibility = ref<string>("");
const name = ref<string>("");
const identifier = ref<string>("");
const newIndexCanvas = ref();

watch(editIndexClicked, () => {
  if (editIndexClicked.value) {
    name.value = selectedIndex.value.name;
    visibility.value = selectedIndex.value.public ? "public" : "private";
    identifier.value = selectedIndex.value.identifier ?? "";
  } else {
    resetInputValues();
  }
});

watch(selectedDataset, () => {
  closeCanvas();
});

const closeCanvas = () => {
  resetInputValues();
  hideOffcanvas(newIndexCanvas);
};

const resetInputValues = () => {
  name.value = "";
  visibility.value = "";
  identifier.value = "";
};

const handleIdentifierChange = debounce(() => {
  if (
    editIndexClicked.value &&
    identifier.value === selectedIndex.value.identifier
  ) {
    identifierError.value = undefined;
    return;
  }
  validateIdentifier(
    $validateIdentifier,
    t("new_dataset_catalog_sidebar.identifier_error_exists"),
    t("new_dataset_catalog_sidebar.identifier_error_invalid"),
    identifier.value
  );
});

const saveIndex = async () => {
  if (visibility.value === "" || name.value === "") {
    toaster.error(
      "Fill all the required fields. They are indicated by * next to the field name."
    );
    return;
  }
  if (identifierError.value) {
    toaster.error(identifierError.value.message);
    return;
  }
  if (!editIndexClicked.value) {
    await createIndex();
  } else {
    await updateIndex();
  }
};

const createIndex = async () => {
  const { error }: any = await $createNewScheme(
    name.value,
    identifier.value,
    "INDEX",
    visibility.value === "public"
  );

  if (error.value) {
    toaster.error(error.value.data.message);
    return;
  }

  // TO DO: when index list is implemented with all the corresponding API calls
  // await fetchIndices(1);

  editIndexClicked.value = false;
  toaster.success(t("add_index_sidebar.create_index_success"));
  closeCanvas();
};

// TESTING NOT PERFORMED: It will be tested properly when index list and index page is implemented
// with the edit button.
const updateIndex = async () => {
  const { error }: any = await $editScheme(
    selectedIndex.value.id,
    name.value,
    identifier.value,
    "INDEX",
    visibility.value === "public"
  );
  await fetchIndices(1);
  if (error.value) {
    toaster.error(error.value.data.message);
    return;
  }

  // await selectNewIndex(selectedIndex.value.id);
  editIndexClicked.value = false;

  toaster.success(t("add_index_sidebar.update_index_success"));
  closeCanvas();
};
</script>
