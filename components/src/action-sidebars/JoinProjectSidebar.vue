<template>
  <ActionSidebar id="offcanvasJoinProject" ref="joinProjectCanvas">
    <ActionSidebarHeader
      :title="$t('join_project_sidebar.join_project')"
      :description="$t('join_project_sidebar.join_project_description')"
      :close-label="$t('cancel')"
      @close="closeCanvas"
    >
      <template #action>
        <ActionSidebarHeaderAction :aria-label="$t('save')" @click="save">
          {{ $t("save") }}
        </ActionSidebarHeaderAction>
      </template>
    </ActionSidebarHeader>
    <ActionSidebarBody>
      <div class="sage-form">
        <ActionFieldRow
          :label="$t('join_project_sidebar.project') + ' *'"
          :description="$t('join_project_sidebar.project_description')"
        >
          <FormSelectInput
            v-model="selectedProjectId"
            :options="projectsOptions"
            :error="selectedProjectError"
            @input="selectedProjectError = ''"
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
import type { Option } from "~/types/form";
import type { Project } from "~/types/Project";
const { t } = useI18n();

const { toaster } = useToaster();

const { $joinProject, $getNotJoinedProjects } = useNuxtApp();
const { fetchJoinedProjects } = useSidebarDataStore();
const projectsOptions = ref<Option[]>([]);
const selectedProjectId = ref<string>("");
const joinProjectCanvas = ref();
const selectedProjectError = ref<string>("");

onMounted(() => {
  getNotJoinedProjects();
});

const getNotJoinedProjects = async () => {
  const { data, error }: any = await $getNotJoinedProjects();
  if (error.value) {
    toaster.error(error.value.data.message);
    return;
  }
  createProjectOptions(data.value.data);
};

const createProjectOptions = (response: Project[]) => {
  projectsOptions.value = response.map((project) => {
    return {
      value: project.id,
      label: project.name,
    };
  });
};

const closeCanvas = () => {
  selectedProjectError.value = "";
  selectedProjectId.value = "";
  hideOffcanvas(joinProjectCanvas);
};

const save = async () => {
  if (selectedProjectId.value === "") {
    selectedProjectError.value = t("new_annotator_sidebar.error.required");
    return;
  }
  const { error }: any = await $joinProject(selectedProjectId.value);
  if (error.value) {
    toaster.error(error.value.data.message);
    return;
  }
  toaster.success(t("join_project_sidebar.join_project_success"));
  getNotJoinedProjects();
  fetchJoinedProjects();

  closeCanvas();
};
</script>
