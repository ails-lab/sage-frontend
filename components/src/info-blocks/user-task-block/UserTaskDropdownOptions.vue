<template>
  <MenuDropdown
    :id="'user-task-dropdown-menu-' + props.userTask.id"
    :items="userTaskDropdownItems"
  >
    <template #icon>
      <i class="more"></i>
    </template>
  </MenuDropdown>
</template>

<script setup lang="ts">
import type { MenuDropdownItems } from "~/types/menu-dropdown";
import type { UserTask } from "~/types/UserTask";
const { t } = useI18n();
const { showConfirmModal } = useModalsStore();
const { selectNewDataset } = useSidebarDataStore();
const { selectedDataset } = storeToRefs(useSidebarDataStore());
const { selectUserTask } = useSelectedUserTask();

const { toaster } = useToaster();
const { $userTaskApi } = useNuxtApp();

const props = defineProps<{ userTask: UserTask }>();

const handleEdit = () => {
  selectUserTask(props.userTask);
};

const deleteUserTask = async () => {
  const { error }: any = await $userTaskApi.deleteUserTask(props.userTask.id);
  if (error.value) {
    toaster.error(t("error.while_deleting", { item: props.userTask.name }));
    return;
  }
  toaster.success(t("success.while_deleting", { item: props.userTask.name }));
  await selectNewDataset(selectedDataset.value?.id);
};
const runUserTask = async () => {
  const { error }: any = await $userTaskApi.runUserTask(props.userTask.id);
  if (error.value) {
    toaster.error(t("error.while_deleting", { item: props.userTask.name }));
    return;
  }
  toaster.success(t("success.while_deleting", { item: props.userTask.name }));
  await selectNewDataset(selectedDataset.value?.id);
};
const scheduleUserTask = async () => {
  const { error }: any = await $userTaskApi.scheduleUserTask(props.userTask.id);
  if (error.value) {
    toaster.error(t("error.while_deleting", { item: props.userTask.name }));
    return;
  }
  toaster.success(t("success.while_deleting", { item: props.userTask.name }));
  await selectNewDataset(selectedDataset.value?.id);
};
const unscheduleUserTask = async () => {
  const { error }: any = await $userTaskApi.unscheduleUserTask(
    props.userTask.id
  );
  if (error.value) {
    toaster.error(t("error.while_deleting", { item: props.userTask.name }));
    return;
  }
  toaster.success(t("success.while_deleting", { item: props.userTask.name }));
  await selectNewDataset(selectedDataset.value?.id);
};

const showDeleteConfirmationModal = () => {
  showConfirmModal(
    t("confirm_delete_this_item", {
      itemToDelete: t("user_task_item.user_task.text"),
    }),
    deleteUserTask
  );
};

const userTaskDropdownItems = computed<MenuDropdownItems>(() => [
  {
    label: t("user_task_item.actions.edit"),
    iconClass: "fa-solid fa-pen-to-square",
    onClick: handleEdit,
    href: "#offcanvasAddTask",
    dataBsToggle: "offcanvas",
  },
  {
    label: t("user_task_item.actions.delete"),
    iconClass: "fa-solid fa-trash-can",
    onClick: showDeleteConfirmationModal,
  },
  {
    isDivider: true,
  },
  {
    label: t("user_task_item.actions.run"),
    iconClass: "fa-solid fa-play",
    onClick: runUserTask,
  },
  { isDivider: true },
  {
    label: t("user_task_item.actions.schedule"),
    iconClass: "fa-solid fa-calendar",
    onClick: scheduleUserTask,
  },
  {
    label: t("user_task_item.actions.unschedule"),
    iconClass: "fa-solid fa-calendar-times",
    onClick: unscheduleUserTask,
  },
]);
</script>

<style lang="scss" scoped>
.fa-ellipsis {
  top: 0;
}
</style>
