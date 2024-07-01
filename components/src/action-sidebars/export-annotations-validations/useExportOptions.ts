export const useExportOptions = () => {
  const { t } = useI18n();
  const serializationOptions = [
    {
      label: t("export_annotations_validations_sidebar.serialization.json_ld"),
      value: "JSON-LD",
    },
    {
      label: t("export_annotations_validations_sidebar.serialization.rdfxml"),
      value: "RDF/XML",
    },
    {
      label: t("export_annotations_validations_sidebar.serialization.ttl"),
      value: "TTL",
    },
  ];

  const archiveOptions = [
    {
      label: t("export_annotations_validations_sidebar.archive.tgz"),
      value: "TGZ",
    },
    {
      label: t("export_annotations_validations_sidebar.archive.zip"),
      value: "ZIP",
    },
  ];

  const includeOptions = [
    {
      label: t("export_annotations_validations_sidebar.include.only_reviewed"),
      key: "onlyReviewd",
      defaultValue: false,
    },
    {
      label: t(
        "export_annotations_validations_sidebar.include.only_non_rejected"
      ),
      key: "onlyNonRejected",
      defaultValue: true,
    },
    {
      label: t("export_annotations_validations_sidebar.include.only_fresh"),
      key: "onlyFresh",
      defaultValue: true,
    },
    {
      label: t("export_annotations_validations_sidebar.include.creator"),
      key: "creator",
      defaultValue: true,
    },
    {
      label: t("export_annotations_validations_sidebar.include.created"),
      key: "created",
      defaultValue: true,
    },
    {
      label: t("export_annotations_validations_sidebar.include.scope"),
      key: "scope",
      defaultValue: true,
    },
    {
      label: t("export_annotations_validations_sidebar.include.score"),
      key: "score",
      defaultValue: true,
    },
    {
      label: t("export_annotations_validations_sidebar.include.selector"),
      key: "selector",
      defaultValue: true,
    },
  ];

  return { serializationOptions, archiveOptions, includeOptions };
};
