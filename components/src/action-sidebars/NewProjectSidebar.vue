<template>
  <ActionSidebar id="offcanvasNewProject" ref="projectCanvas">
    <ActionSidebarHeader
      :title="
        editProjectClicked
          ? $t('new_project_sidebar.edit_project')
          : $t('new_project_sidebar.new_project')
      "
      :description="$t('new_project_sidebar.project_description')"
      :close-label="$t('cancel')"
      @close="closeCanvas"
    >
      <template #action>
        <ActionSidebarHeaderAction
          :aria-label="$t('save')"
          @click="saveProject"
        >
          {{ $t("save") }}
        </ActionSidebarHeaderAction>
      </template>
    </ActionSidebarHeader>
    <ActionSidebarBody>
      <div class="sage-form">
        <ActionFieldRow
          :label="$t('new_project_sidebar.name') + ' *'"
          :description="$t('new_project_sidebar.name_description')"
        >
          <FormTextInput
            v-model="formValues.name"
            :error="formErrors.name"
            @input="formErrors.name = ''"
          />
        </ActionFieldRow>
        <ActionFieldRow
          :label="$t('new_project_sidebar.identifier')"
          :description="$t('new_project_sidebar.identifier_description')"
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
            :error="formErrors.visibility"
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
            @input="formErrors.visibility = ''"
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
import { useSidebarDataStore } from "~/stores/sidebarData";

const { t } = useI18n();
const { identifierError, validateIdentifier } = useIdentifierValidation();

const { toaster } = useToaster();

const { editProjectClicked, selectedProject } = storeToRefs(
  useSidebarDataStore()
);
const { fetchMyProjects, selectNewProject } = useSidebarDataStore();
const { $createProject, $editProject, $validateProjectIdentifier } =
  useNuxtApp();

const formValues = ref({
  name: "",
  identifier: "",
  visibility: "",
});
const formErrors = ref({
  name: "",
  visibility: "",
});

const projectCanvas = ref();

watch(editProjectClicked, () => {
  if (editProjectClicked.value) {
    formValues.value.name = selectedProject.value.name;
    formValues.value.visibility = selectedProject.value.public
      ? "public"
      : "private";
    formValues.value.identifier = selectedProject.value.identifier ?? "";
  }
});

const resetInputValues = () => {
  formValues.value.name = "";
  formValues.value.visibility = "";
  formValues.value.identifier = "";
};

const resetFormErrors = () => {
  formErrors.value.name = "";
  formErrors.value.visibility = "";
};

const closeCanvas = () => {
  resetFormErrors();
  resetInputValues();
  editProjectClicked.value = false;
  hideOffcanvas(projectCanvas);
};

const handleIdentifierChange = debounce(() => {
  if (
    editProjectClicked.value &&
    formValues.value.identifier === selectedProject.value.identifier
  ) {
    identifierError.value = undefined;
    return;
  }
  validateIdentifier(
    $validateProjectIdentifier,
    t("new_dataset_catalog_sidebar.identifier_error_exists"),
    t("new_dataset_catalog_sidebar.identifier_error_invalid"),
    formValues.value.identifier
  );
});

const saveProject = async () => {
  if (formValues.value.name === "") {
    formErrors.value.name = t("new_annotator_sidebar.error.required");
  }
  if (formValues.value.visibility === "") {
    formErrors.value.visibility = t("new_annotator_sidebar.error.required");
  }
  if (
    formValues.value.name === "" ||
    formValues.value.visibility === "" ||
    identifierError.value
  )
    return;
  if (!editProjectClicked.value) {
    await createProject();
  } else {
    await updateProject();
  }
};

const createProject = async () => {
  const { error }: any = await $createProject(
    formValues.value.name,
    formValues.value.visibility === "public",
    formValues.value.identifier
  );

  if (error.value) {
    toaster.error(error.value.data.message);
    return;
  }

  toaster.success(t("new_project_sidebar.create_project_success"));

  // TO DO: when project list is implemented with all the corresponding API calls
  await fetchMyProjects();

  closeCanvas();
};

// TESTING NOT PERFORMED: It will be tested properly when project list and project page is implemented
// with the edit button.
const updateProject = async () => {
  const { error }: any = await $editProject(
    selectedProject.value.id,
    formValues.value.name,
    formValues.value.visibility === "public",
    formValues.value.identifier
  );
  if (error.value) {
    toaster.error(error.value.data.message);
    return;
  }

  toaster.success(t("new_project_sidebar.update_project_success"));

  // TODO: - when project list is implemented
  await fetchMyProjects();
  await selectNewProject(selectedProject.value.id);

  closeCanvas();
};
</script>
