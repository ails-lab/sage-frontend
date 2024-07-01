import type { MenuDropdownItems } from "~/types/menu-dropdown";

export const useDatasetDropdownOperations = () => {
  const { t } = useI18n();
  const { toaster } = useToaster();

  const { selectNewDataset } = useSidebarDataStore();
  const { selectedDataset } = storeToRefs(useSidebarDataStore());
  const { $publishDataset, $republishDataset, $unpublishDataset } =
    useNuxtApp();

  const isPublished = computed(
    () => selectedDataset.value?.publishState?.state === "PUBLISHED"
  );

  const isUnpublishedDisabled = computed(() => {
    return selectedDataset.value?.publishState?.state === "UNPUBLISHED";
  });

  const isPublidhedDisabled = computed(() => {
    const hasExecutedMapping = selectedDataset.value?.mappings?.filter(
      (mapping) =>
        mapping.instances?.find(
          (instance) => instance.executeState.state === "EXECUTED"
        )
    )?.length;
    const hasRdfFiles = selectedDataset.value?.rdfFiles?.length;
    if (hasRdfFiles) return false;

    return (
      (selectedDataset.value?.publishState?.state !== "UNPUBLISHED" &&
        selectedDataset.value?.publishState?.state !== "PUBLISHING_FAILED") ||
      !hasExecutedMapping
    );
  });

  const handlePublish = async () => {
    const { error }: any = await $publishDataset(selectedDataset.value.id);
    if (error.value) {
      toaster.error(t("dataset_page.publish_error"));
    }
    await selectNewDataset(selectedDataset.value.id);
  };

  const handleRepublish = async (mode: "all" | "onlyNew" | "metadata") => {
    const { error }: any = await $republishDataset(
      selectedDataset.value.id,
      mode
    );
    if (error.value) {
      toaster.error(t("dataset_page.republish_error"));
    }
    await selectNewDataset(selectedDataset.value.id);
  };

  const handleUnPublish = async () => {
    const { error }: any = await $unpublishDataset(selectedDataset.value.id);
    if (error.value) {
      toaster.error(t("dataset_page.unpublish_error"));
    }
    await selectNewDataset(selectedDataset.value.id);
  };

  const handleCopySparqlToClipboard = () => {
    const baseUrl = `${useRuntimeConfig().public.baseUrl}`;
    const text = baseUrl + "/content/" + selectedDataset.value.uuid + "/sparql";
    copyToClipboard(text);
  };

  const dropdownItems = computed<MenuDropdownItems>(() => [
    {
      label: t("dataset_page.add_to_project"),
      iconClass: "fa-solid fa-plus",
    },
    { isDivider: true },
    {
      label: t("dataset_page.publish"),
      iconClass: "fa-regular fa-paper-plane",
      isDisabled: isPublidhedDisabled.value,
      onClick: handlePublish,
    },
    {
      label: useRuntimeConfig().public.ai4cultureDeployment
        ? t("dataset_page.republish")
        : t("dataset_page.republish_content_metadata"),
      iconClass: "fa-regular fa-calendar-plus",
      isDisabled: !isPublished.value,
      onClick: () => handleRepublish("all"),
    },
    {
      label: t("dataset_page.republish_unpublished_content_metadata"),
      iconClass: "fa-regular fa-calendar-check",
      isDisabled: !isPublished.value,
      isHidden: useRuntimeConfig().public.ai4cultureDeployment,
      onClick: () => handleRepublish("onlyNew"),
    },
    {
      label: t("dataset_page.republish_metadata"),
      iconClass: "fa-regular fa-calendar-minus",
      isDisabled: !isPublished.value,
      isHidden: useRuntimeConfig().public.ai4cultureDeployment,
      onClick: () => handleRepublish("metadata"),
    },
    {
      label: t("dataset_page.unpublish"),
      iconClass: "fa-regular fa-calendar-xmark",
      isDisabled: isUnpublishedDisabled.value,
      onClick: handleUnPublish,
    },
    { isDivider: true },
    {
      label: t("dataset_page.view_dataset_description"),
      iconClass: "fa-solid fa-info",
      href: "#offcanvasViewDatasetDescription",
      dataBsToggle: "offcanvas",
      isDisabled: !isPublished.value,
    },
    { isDivider: true },
    {
      label: t("dataset_page.query_with_sparql"),
      iconClass: "fa-solid fa-cube",
      isDisabled: !isPublished.value,
      href: "#offcanvasSparqlEditor",
      dataBsToggle: "offcanvas",
    },
    {
      label: t("dataset_page.copy_sparql"),
      iconClass: "fa-regular fa-clipboard",
      isDisabled: !isPublished.value,
      onClick: handleCopySparqlToClipboard,
    },
  ]);

  return { dropdownItems };
};
