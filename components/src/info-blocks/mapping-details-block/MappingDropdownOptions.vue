<template>
  <MenuDropdown
    :id="'dropdown-menu-mapping-' + props.scope"
    :items="mappingDropdownItems"
  >
    <template #icon>
      <i :class="iconClass"></i>
    </template>
  </MenuDropdown>
</template>

<script setup lang="ts">
import type { Mapping, Instance } from "~/types/Mapping";
import type { MenuDropdownItems } from "~/types/menu-dropdown";
const { t } = useI18n();
const { toaster } = useToaster();

const { $mappingApi } = useNuxtApp();

const { clearLastMappingExecution } = useSidebarDataStore();
const { selectMapping } = useSelectedMapping();
const { selectD2rml } = useSelectedD2rml();

type MappingScope = "flat" | "parametric" | "instance";
const props = defineProps<{
  mapping: Mapping;
  instance?: Instance;
  scope: MappingScope;
}>();

const iconClass = computed(() =>
  props.scope === "instance" ? "fa-solid fa-ellipsis" : "more"
);

const instanceId = computed(() => props.instance?.id);

const checkIfPublishedWithNoNewerExecution = (instance: Instance) => {
  const isPublishedAndExecuted =
    instance?.executeState.state === "EXECUTED" &&
    instance?.publishState.state === "PUBLISHED";
  if (!isPublishedAndExecuted) {
    return false;
  }
  if (!instance.publishState.completedAt) {
    return false;
  }
  if (!instance.executeState.completedAt) {
    return false;
  }
  const publishDate = new Date(instance.publishState.completedAt);
  const executeDate = new Date(instance.executeState.completedAt);

  return publishDate.getTime() >= executeDate.getTime();
};

const instanceStates = computed(() => {
  const instanceIndex = instanceId.value
    ? props.mapping.instances.findIndex(
        (instance) => instance.id === instanceId.value
      )
    : 0;

  const isPublishedWithNoNewerExecution = checkIfPublishedWithNoNewerExecution(
    props.mapping.instances[instanceIndex]
  );
  return {
    isExecuting:
      props.mapping.instances[instanceIndex]?.executeState.state ===
      "EXECUTING",
    isExecuted:
      props.mapping.instances[instanceIndex]?.executeState.state === "EXECUTED",
    isPublished:
      props.mapping.instances[instanceIndex]?.publishState.state ===
      "PUBLISHED",
    isPublishing:
      props.mapping.instances[instanceIndex]?.publishState.state ===
      "PUBLISHING",
    isLastExecutionDisabled: isPublishedWithNoNewerExecution,
  };
});

const handleEdit = () => {
  selectMapping({ mapping: props.mapping, instance: props.instance });
};

const { selectNewDataset } = useSidebarDataStore();
const { selectedDataset } = storeToRefs(useSidebarDataStore());

const handleDeleteMapping = async () => {
  const { data, error }: any = await $mappingApi.deleteMapping(
    props.mapping.id
  );
  if (error.value) {
    toaster.error(error.value.message);
  } else {
    toaster.success(data.value.message);
    await selectNewDataset(selectedDataset.value.id);
  }
};

const handleDeleteMappingInstance = async () => {
  const { data, error }: any = await $mappingApi.deleteMappingInstance(
    props.mapping.id,
    instanceId.value!
  );
  if (error.value) {
    toaster.error(error.value.message);
  } else {
    toaster.success(data.value.message);
    await selectNewDataset(selectedDataset.value.id);
  }
};

const { showConfirmModal } = useModalsStore();
const handleDeleteConfirmation = () => {
  showConfirmModal(
    t(
      instanceId.value
        ? "mapping_item.confirm.instance.delete"
        : "mapping_item.confirm.mapping.delete"
    ),
    instanceId.value ? handleDeleteMappingInstance : handleDeleteMapping
  );
};

const { selectExecution } = useSelectedExecution();
const previewExecution = (isPublished: boolean) => {
  if (instanceId.value) {
    selectExecution({
      id: instanceId.value,
      mappingId: props.mapping.id,
      type: "instance",
      isPublished,
      executeState: props.instance?.executeState,
    });
  } else {
    selectExecution({
      id: props.mapping.id,
      type: "mapping",
      isPublished,
      executeState: props.instance?.executeState,
    });
  }
};

const downloadLastExecution = async () => {
  const { error } = await $mappingApi.downloadLastExecution(
    props.mapping.id,
    instanceId.value
  );
  if (error.value) {
    toaster.error(t("error.while_downloading"));
  }
};
const clearLastExecution = async () => {
  if (!props.mapping.id || !instanceId.value) {
    return;
  }
  try {
    await clearLastMappingExecution(props.mapping.id, instanceId.value);
    toaster.success(t("mapping_item.actions.clear_last_execution_success"));
  } catch (error: any) {
    toaster.error(error.value?.message);
  }
};
const validateLastExecution = () => {};

const downloadPublishedExecution = async () => {
  const { error } = await $mappingApi.downloadPublishedExecution(
    props.mapping.id,
    instanceId.value
  );
  if (error.value) {
    toaster.error(t("error.while_downloading"));
  }
};

const handleOpenAddInstance = () => {
  selectMapping({ mapping: props.mapping });
};

const handleOpenEditD2rml = () => {
  selectD2rml({ mapping: props.mapping, mode: "view" });
};

const handleOpenAttachSourceDataFile = () => {
  selectMapping({ mapping: props.mapping, instance: props.instance });
};

const handleStartExecution = async () => {
  const { data, error }: any = await $mappingApi.startMappingExecution(
    props.mapping.id,
    instanceId.value
  );
  if (error.value) {
    toaster.error(error.value.message);
  } else {
    toaster.success(data.value.message);
  }
};

const handleStopExecution = async () => {
  const { data, error }: any = await $mappingApi.stopMappingExecution(
    props.mapping.id,
    instanceId.value
  );
  if (error.value) {
    toaster.error(error.value.message);
  } else {
    toaster.success(data.value.message);
  }
};

const filterOutDropdownItems = (itemScope: MappingScope[]) =>
  !itemScope.includes(props.scope);

const mappingDropdownItems = computed<MenuDropdownItems>(() => [
  {
    label: t("mapping_item.actions.edit"),
    iconClass: "fa-regular fa-pen-to-square",
    isHidden: filterOutDropdownItems(["flat", "parametric", "instance"]),
    onClick: handleEdit,
    dataBsToggle: "offcanvas",
    href: instanceId.value
      ? "#offcanvasAddMappingInstance"
      : "#offcanvasAddMapping",
  },
  {
    label: t("mapping_item.actions.delete"),
    iconClass: "fa-regular fa-trash-can",
    isHidden: filterOutDropdownItems(["flat", "parametric", "instance"]),
    isDisabled:
      instanceStates.value.isExecuting || instanceStates.value.isPublished,
    onClick: handleDeleteConfirmation,
  },
  {
    isDivider: true,
    isHidden: filterOutDropdownItems(["flat", "parametric", "instance"]),
  },
  {
    label: t("mapping_item.actions.add_instance"),
    iconClass: "fa-regular fa-plus",
    isHidden: filterOutDropdownItems(["parametric"]),
    onClick: handleOpenAddInstance,
    dataBsToggle: "offcanvas",
    href: "#offcanvasAddMappingInstance",
  },
  { isDivider: true, isHidden: filterOutDropdownItems(["parametric"]) },
  {
    label: t("mapping_item.actions.edit_d2rml_document"),
    iconClass: "fa-solid fa-sliders",
    isHidden: filterOutDropdownItems(["flat", "parametric"]),
    onClick: handleOpenEditD2rml,
    dataBsToggle: "offcanvas",
    href: "#offcanvasD2rml",
  },
  {
    label: t("mapping_item.actions.attach_source_data_file"),
    iconClass: "fa-solid fa-paperclip",
    isHidden: filterOutDropdownItems(["flat", "parametric", "instance"]),
    onClick: handleOpenAttachSourceDataFile,
    dataBsToggle: "offcanvas",
    href: "#offcanvasAttachSourceDataFile",
  },
  {
    isDivider: true,
    isHidden: filterOutDropdownItems(["flat", "parametric", "instance"]),
  },
  {
    label: t("mapping_item.actions.execute"),
    iconClass: "fa-regular fa-square-caret-right",
    isHidden: filterOutDropdownItems(["flat", "instance"]),
    onClick: handleStartExecution,
    isDisabled: instanceStates.value.isExecuting,
  },
  {
    label: t("mapping_item.actions.stop_execution"),
    iconClass: "fa-regular fa-square",
    isHidden: filterOutDropdownItems(["flat", "instance"]),
    onClick: handleStopExecution,
    isDisabled: !instanceStates.value.isExecuting,
  },
  { isDivider: true, isHidden: filterOutDropdownItems(["flat", "instance"]) },
  {
    label: t("mapping_item.actions.preview_last_execution"),
    iconClass: "fa-regular fa-eye",
    isHidden: filterOutDropdownItems(["flat", "instance"]),
    onClick: () => previewExecution(false),
    dataBsToggle: "offcanvas",
    href: "#offcanvasPreviewExecution",
    isDisabled:
      !instanceStates.value.isExecuted ||
      instanceStates.value.isLastExecutionDisabled,
  },
  {
    label: t("mapping_item.actions.download_last_execution"),
    iconClass: "fa-solid fa-arrow-down",
    isHidden: filterOutDropdownItems(["flat", "instance"]),
    onClick: downloadLastExecution,
    isDisabled:
      !instanceStates.value.isExecuted ||
      instanceStates.value.isLastExecutionDisabled,
  },
  {
    label: t("mapping_item.actions.clear_last_execution"),
    iconClass: "fa-solid fa-xmark",
    isHidden: filterOutDropdownItems(["flat", "instance"]),
    onClick: clearLastExecution,
    isDisabled:
      !instanceStates.value.isExecuted ||
      instanceStates.value.isLastExecutionDisabled,
  },
  {
    label: t("mapping_item.actions.validate_last_execution"),
    iconClass: "fa-solid fa-check-double",
    isHidden:
      (useRuntimeConfig().public.ai4cultureDeployment &&
        !props.mapping.shaclId) ||
      filterOutDropdownItems(["flat", "instance"]),
    onClick: validateLastExecution,
    isDisabled: !instanceStates.value.isExecuted,
  },
  { isDivider: true, isHidden: filterOutDropdownItems(["flat", "instance"]) },
  {
    label: t("mapping_item.actions.preview_published_execution"),
    iconClass: "fa-regular fa-eye",
    isHidden: filterOutDropdownItems(["flat", "instance"]),
    onClick: () => previewExecution(true),
    dataBsToggle: "offcanvas",
    href: "#offcanvasPreviewExecution",
    isDisabled:
      !instanceStates.value.isPublished || !instanceStates.value.isExecuted,
  },
  {
    label: t("mapping_item.actions.download_published_execution"),
    iconClass: "fa-solid fa-arrow-down",
    isHidden: filterOutDropdownItems(["flat", "instance"]),
    onClick: downloadPublishedExecution,
    isDisabled:
      !instanceStates.value.isPublished || !instanceStates.value.isExecuted,
  },
]);
</script>

<style lang="scss" scoped>
.fa-ellipsis {
  top: 0;
}
</style>
