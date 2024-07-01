import type { FilterValidation } from "~/types/filter-validation";
import type { MenuDropdownItems } from "~/types/menu-dropdown";

export const useFilterValidationOptions = (
  aegId: string,
  validation: Ref<FilterValidation>
) => {
  const { t } = useI18n();
  const { toaster } = useToaster();
  const { showConfirmModal } = useModalsStore();
  const { $filterValApi } = useNuxtApp();
  const { selectExecution } = useSelectedExecution();
  const { selectValidation } = useSelectedValidation();
  const { deleteFilterValidation } = useAnnotationsStore();

  const validationState = computed(() => ({
    isDeleteDisabled: validation.value.publishState.state !== "UNPUBLISHED",
    isPublisheDisabled:
      validation.value.publishState.state !== "UNPUBLISHED" &&
      validation.value.publishState.state !== "PUBLISHING_FAILED" &&
      !validation.value.newExecution,
    isUnpublishDisabled: validation.value.publishState.state === "UNPUBLISHED",
    isExecutionDisabled: validation.value.executeState.state === "EXECUTING",
    isLastExecutionDisabled:
      validation.value.executeState.state !== "EXECUTED" ||
      (validation.value.publishState.state === "PUBLISHED" &&
        !validation.value.newExecution),
    isPublishedExecutionDisabled:
      validation.value.publishState.state !== "PUBLISHED" ||
      validation.value.executeState.state !== "EXECUTED",
  }));

  const handleEdit = () => {
    selectValidation({
      type: "filter",
      aegId,
      validation: validation.value,
    });
    showCanvasById("offcanvasNewFilterValidation");
  };

  const handleDelete = async () => {
    try {
      await deleteFilterValidation({
        aegId,
        validationId: validation.value.id,
      });
      toaster.success(t("validation_item.actions.delete.success"));
    } catch (error: any) {
      toaster.error(error.value.message);
    }
  };
  const handleDeleteConfirmation = () => {
    showConfirmModal(t("validation_item.actions.delete.confirm"), handleDelete);
  };

  const handleExecute = async () => {
    const { error } = await $filterValApi.execute(validation.value.id);
    if (error.value) {
      toaster.error(error.value.message);
    } else {
      toaster.success(t("validation_item.actions.execute.success"));
    }
  };
  const handlePublish = async () => {
    const { error } = await $filterValApi.publish(validation.value.id);
    if (error.value) {
      toaster.error(error.value.message);
    } else {
      toaster.success(t("validation_item.actions.publish.success"));
    }
  };
  const handleUnpublish = async () => {
    const { error } = await $filterValApi.unpublish(validation.value.id);
    if (error.value) {
      toaster.error(error.value.message);
    } else {
      toaster.success(t("validation_item.actions.unpublish.success"));
    }
  };

  const handlePreviewExecution = (isPublished: boolean) => {
    selectExecution({
      type: "filterValidation",
      id: validation.value.id,
      isPublished,
      executeState: validation.value.executeState,
    });
  };

  const handleDownloadLast = async () => {
    const { error } = await $filterValApi.downloadLastExecution(
      validation.value.id
    );
    if (error.value) {
      toaster.error(error.value.message);
    }
  };
  const handleClearLast = async () => {
    const { error } = await $filterValApi.clearLastExecution(
      validation.value.id
    );
    if (error.value) {
      toaster.error(error.value.message);
    } else {
      toaster.success(t("validation_item.actions.clear_last.success"));
    }
  };

  const handleDownloadPublished = async () => {
    const { error } = await $filterValApi.downloadPublishedExecution(
      validation.value.id
    );
    if (error.value) {
      toaster.error(error.value.message);
    }
  };

  const dropdownItems = computed<MenuDropdownItems>(() => [
    {
      label: t("validation_item.actions.edit.title"),
      iconClass: "fa-solid fa-pen",
      onClick: handleEdit,
    },
    {
      label: t("validation_item.actions.delete.title"),
      iconClass: "fa-regular fa-trash-can",
      onClick: handleDeleteConfirmation,
      isDisabled: validationState.value.isDeleteDisabled,
    },
    { isDivider: true },
    {
      label: t("validation_item.actions.execute.title"),
      iconClass: "fa-solid fa-play",
      onClick: handleExecute,
      isDisabled: validationState.value.isExecutionDisabled,
    },
    { isDivider: true },
    {
      label: t("validation_item.actions.publish.title"),
      iconClass: "fa-regular fa-calendar-check",
      onClick: handlePublish,
      isDisabled: validationState.value.isPublisheDisabled,
    },
    {
      label: t("validation_item.actions.unpublish.title"),
      iconClass: "fa-regular fa-calendar-xmark",
      onClick: handleUnpublish,
      isDisabled: validationState.value.isUnpublishDisabled,
    },
    { isDivider: true },
    {
      label: t("validation_item.actions.preview_last.title"),
      iconClass: "fa-regular fa-eye",
      onClick: () => handlePreviewExecution(false),
      isDisabled: validationState.value.isLastExecutionDisabled,
    },
    {
      label: t("validation_item.actions.download_last.title"),
      iconClass: "fa-solid fa-download",
      onClick: handleDownloadLast,
      isDisabled: validationState.value.isLastExecutionDisabled,
    },
    {
      label: t("validation_item.actions.clear_last.title"),
      iconClass: "fa-solid fa-xmark",
      onClick: handleClearLast,
      isDisabled: validationState.value.isLastExecutionDisabled,
    },
    { isDivider: true },
    {
      label: t("validation_item.actions.preview_published.title"),
      iconClass: "fa-regular fa-eye",
      onClick: () => handlePreviewExecution(true),
      isDisabled: validationState.value.isPublishedExecutionDisabled,
    },
    {
      label: t("validation_item.actions.download_published.title"),
      iconClass: "fa-solid fa-download",
      onClick: handleDownloadPublished,
      isDisabled: validationState.value.isPublishedExecutionDisabled,
    },
  ]);

  return { dropdownItems };
};
