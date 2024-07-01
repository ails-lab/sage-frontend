import type { Annotator } from "~/types/Annotator";
import type { MenuDropdownItems } from "~/types/menu-dropdown";

export const useAnnotatorOptions = (
  annotator: Ref<Annotator>,
  shouldDisablePublishOptions: Ref<boolean>
) => {
  const { t } = useI18n();
  const { toaster } = useToaster();
  const annotatorsStore = useAnnotatorsStore();
  const { showConfirmModal } = useModalsStore();
  const { selectAnnotator } = useSelectedAnnotator();

  const annotatorState = computed(() => ({
    isDeleteDisabled: annotator.value.publishState.state !== "UNPUBLISHED",
    isExecutionDisabled: annotator.value.executeState.state === "EXECUTING",
    isPreviewAnnotationsDisabled:
      annotator.value.executeState.state !== "EXECUTED",
    isRepublishDisabled:
      shouldDisablePublishOptions.value ||
      (annotator.value.publishState.state !== "PUBLISHED" &&
        !annotator.value.newExecution),
    isPublisheDisabled:
      shouldDisablePublishOptions.value ||
      (annotator.value.publishState.state !== "UNPUBLISHED" &&
        annotator.value.publishState.state !== "PUBLISHING_FAILED" &&
        !annotator.value.newExecution),
    isUnpublishDisabled:
      shouldDisablePublishOptions.value ||
      annotator.value.publishState.state === "UNPUBLISHED",
    isLastExecutionDisabled:
      annotator.value.publishState.state === "PUBLISHED" &&
      !annotator.value.newExecution,
    isPublishedExecutionDisabled:
      annotator.value.publishState.state !== "PUBLISHED" ||
      annotator.value.executeState.state !== "EXECUTED",
  }));

  const isThesaurus = computed(() => Boolean(annotator.value.thesaurus));

  const handleEdit = () => {
    selectAnnotator(annotator.value);
    showCanvasById("offcanvasNewAnnotator");
  };

  const handleDelete = async () => {
    try {
      await annotatorsStore.deleteAnnotator(annotator.value.id);
    } catch (err: any) {
      toaster.error(err);
    }
  };

  const handleDeleteConfirmation = () => {
    showConfirmModal(t("annotator_item.actions.delete.confirm"), () =>
      handleDelete()
    );
  };

  const handlePrepare = async () => {
    await annotatorsStore.prepare(annotator.value.id);
  };

  const handleExecute = async () => {
    try {
      await annotatorsStore.execute(annotator.value.id);
      toaster.success(t("annotator_item.actions.execute.success"));
    } catch (err: any) {
      toaster.error(err);
    }
  };

  const handleStopExecution = async () => {
    try {
      await annotatorsStore.stopExecution(annotator.value.id);
      toaster.success(t("annotator_item.actions.stop_execution.success"));
    } catch (err: any) {
      toaster.error(err);
    }
  };

  const handlePreviewAnnotations = () => {
    selectAnnotator(annotator.value);
    showCanvasById("offcanvasPreviewAnnotations");
  };

  const handlePublish = async () => {
    try {
      await annotatorsStore.publish(annotator.value.id);
      toaster.success(t("annotator_item.actions.publish.success"));
    } catch (err: any) {
      toaster.error(err);
    }
  };

  const handleRepublish = async () => {
    try {
      await annotatorsStore.republish(annotator.value.id);
      toaster.success(t("annotator_item.actions.republish.success"));
    } catch (err: any) {
      toaster.error(err);
    }
  };

  const handleUnpublish = async () => {
    try {
      await annotatorsStore.unpublish(annotator.value.id);
      toaster.success(t("annotator_item.actions.unpublish.success"));
    } catch (err: any) {
      toaster.error(err);
    }
  };

  const { selectExecution } = useSelectedExecution();
  const handlePreviewExecution = (isPublished: boolean) => {
    selectExecution({
      id: annotator.value.id,
      type: "annotator",
      isPublished,
      executeState: annotator.value.executeState,
    });
  };

  const handleDownloadLastExecution = async () => {
    try {
      await annotatorsStore.downloadLastExecution(annotator.value.id);
    } catch (err: any) {
      toaster.error(err);
    }
  };

  const handleClearLastExecution = async () => {
    try {
      await annotatorsStore.clearLastExecution(annotator.value.id);
      toaster.success(t("annotator_item.actions.clear_last_execution.success"));
    } catch (err: any) {
      toaster.error(err);
    }
  };

  const handleDownloadPublishedExecution = async () => {
    try {
      await annotatorsStore.downloadPublishedExecution(annotator.value.id);
    } catch (err: any) {
      toaster.error(err);
    }
  };

  const dropdownOptions = computed<MenuDropdownItems>(() => [
    {
      label: t("annotator_item.actions.edit.title"),
      iconClass: "fa-regular fa-pen-to-square",
      onClick: handleEdit,
    },
    {
      label: t("annotator_item.actions.delete.title"),
      iconClass: "fa-regular fa-trash-can",
      onClick: handleDeleteConfirmation,
      isDisabled: annotatorState.value.isDeleteDisabled,
    },
    {
      isDivider: true,
    },
    {
      label: t("annotator_item.actions.prepare.title"),
      iconClass: "fa-solid fa-spinner",
      onClick: handlePrepare,
      isHidden: !isThesaurus.value,
    },
    {
      label: t("annotator_item.actions.execute.title"),
      iconClass: "fa-regular fa-square-caret-right",
      onClick: handleExecute,
      isDisabled: annotatorState.value.isExecutionDisabled,
    },
    {
      label: t("annotator_item.actions.stop_execution.title"),
      iconClass: "fa-regular fa-square",
      onClick: handleStopExecution,
      isDisabled: !annotatorState.value.isExecutionDisabled,
    },
    { isDivider: true },
    {
      label: t("annotator_item.actions.preview_annotations.title"),
      iconClass: "fa-regular fa-rectangle-list",
      href: "#offcanvasPreviewAnnotations",
      dataBsToggle: "offcanvas",
      onClick: handlePreviewAnnotations,
      isDisabled: annotatorState.value.isPreviewAnnotationsDisabled,
    },
    { isDivider: true },
    {
      label: t("annotator_item.actions.publish.title"),
      iconClass: "fa-regular fa-calendar-check",
      onClick: handlePublish,
      isDisabled: annotatorState.value.isPublisheDisabled,
    },
    {
      label: t("annotator_item.actions.republish.title"),
      iconClass: "fa-regular fa-calendar-check",
      onClick: handleRepublish,
      isDisabled: annotatorState.value.isRepublishDisabled,
    },
    {
      label: t("annotator_item.actions.unpublish.title"),
      iconClass: "fa-regular fa-calendar-xmark",
      onClick: handleUnpublish,
      isDisabled: annotatorState.value.isUnpublishDisabled,
    },
    { isDivider: true },
    {
      label: t("annotator_item.actions.preview_last_execution.title"),
      iconClass: "fa-regular fa-eye",
      onClick: () => handlePreviewExecution(false),
      dataBsToggle: "offcanvas",
      href: "#offcanvasPreviewExecution",
      isDisabled: annotatorState.value.isLastExecutionDisabled,
    },
    {
      label: t("annotator_item.actions.download_last_execution.title"),
      iconClass: "fa-solid fa-download",
      onClick: handleDownloadLastExecution,
      isDisabled: annotatorState.value.isLastExecutionDisabled,
    },
    {
      label: t("annotator_item.actions.clear_last_execution.title"),
      iconClass: "fa-solid fa-xmark",
      onClick: handleClearLastExecution,
      isDisabled: annotatorState.value.isLastExecutionDisabled,
    },
    { isDivider: true },
    {
      label: t("annotator_item.actions.preview_published_execution.title"),
      iconClass: "fa-regular fa-eye",
      onClick: () => handlePreviewExecution(true),
      dataBsToggle: "offcanvas",
      href: "#offcanvasPreviewExecution",
      isDisabled: annotatorState.value.isPublishedExecutionDisabled,
    },
    {
      label: t("annotator_item.actions.download_published_execution.title"),
      iconClass: "fa-solid fa-download",
      onClick: handleDownloadPublishedExecution,
      isDisabled: annotatorState.value.isPublishedExecutionDisabled,
    },
  ]);

  return { dropdownOptions };
};
