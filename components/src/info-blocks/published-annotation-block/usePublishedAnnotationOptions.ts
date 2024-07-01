import type { MenuDropdownItems } from "~/types/menu-dropdown";

export const usePublishedAnnotationOptions = (
  aegId: string,
  hasPagedAnnotationValidations: boolean
) => {
  const { t } = useI18n();
  const { selectValidation } = useSelectedValidation();

  const handleNewValidation = (type: "paged" | "filter") => {
    selectValidation({ type, aegId });
  };

  const handleOpenExportSidebar = () => {
    selectValidation({ aegId, type: "export" });
  };

  const dropdownItems = computed<MenuDropdownItems>(() => [
    {
      label: t("dataset_schema.published_annotations.view_annotations"),
      iconClass: "fa-regular fa-rectangle-list",
      isDisabled: true,
    },
    { isDivider: true },
    {
      label: t("dataset_schema.published_annotations.new_paged_validation"),
      iconClass: "fa-regular fa-file-lines",
      href: "#offcanvasContributorPagedValidation",
      dataBsToggle: "offcanvas",
      isDisabled: hasPagedAnnotationValidations,
      onClick: () => handleNewValidation("paged"),
    },
    {
      label: t("dataset_schema.published_annotations.new_filter_validation"),
      iconClass: "fa-solid fa-filter",
      href: "#offcanvasNewFilterValidation",
      dataBsToggle: "offcanvas",
      onClick: () => handleNewValidation("filter"),
    },
    { isDivider: true },
    {
      label: t("dataset_schema.published_annotations.export_all"),
      iconClass: "fa-solid fa-download",
      href: "#offcanvasExportAnnotationsValidations",
      isDisabled: true,
      dataBsToggle: "offcanvas",
      onClick: handleOpenExportSidebar,
    },
    { isDivider: true },
    {
      label: t("dataset_schema.published_annotations.score_validation_dist"),
      iconClass: "fa-solid fa-download",
      isDisabled: true,
    },
  ]);

  return { dropdownItems };
};
