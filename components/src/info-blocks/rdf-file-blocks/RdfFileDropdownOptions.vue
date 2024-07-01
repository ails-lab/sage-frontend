<template>
  <MenuDropdown
    :id="'rdf-dropdown-menu-' + props.rdfFile.id"
    :items="rdfFileDropdownItems"
  >
    <template #icon>
      <i class="more"></i>
    </template>
  </MenuDropdown>
</template>

<script setup lang="ts">
import type { MenuDropdownItems } from "~/types/menu-dropdown";
import { RdfDataFileProp } from "~/types/RdfDataFile";
const { t } = useI18n();
const { showConfirmModal } = useModalsStore();
const { selectNewDataset } = useSidebarDataStore();
const { selectedDataset } = storeToRefs(useSidebarDataStore());

const { toaster } = useToaster();
const { $deleteRdfDataFile, $downloadRdfFile, $downloadPublishedRdfFile } =
  useNuxtApp();

const emit = defineEmits(["edit", "previewRdf", "previewPublishedRdf"]);

const props = defineProps({
  rdfFile: {
    type: RdfDataFileProp,
    required: true,
  },
});

const rdfFileName = computed(() => props.rdfFile?.executeState?.fileName);

const handleEdit = () => {
  emit("edit", props.rdfFile);
};

const handleViewRdf = () => {
  if (rdfFileName.value?.endsWith(".zip")) {
    return;
  }
  emit("previewRdf");
};
const handleViewPublishedRdf = () => {
  if (rdfFileName.value?.endsWith(".zip")) {
    return;
  }
  emit("previewPublishedRdf");
};

const deleteRdfFile = async () => {
  const { error }: any = await $deleteRdfDataFile(props.rdfFile.id);
  if (error.value) {
    toaster.error(t("error.while_deleting", { item: props.rdfFile.name }));
    return;
  }
  toaster.success(t("success.while_deleting", { item: props.rdfFile.name }));
  await selectNewDataset(selectedDataset.value?.id);
};

const showDeleteConfirmationModal = () => {
  showConfirmModal(
    t("confirm_delete_this_item", {
      itemToDelete: t("rdf_item.rdf_data_file.text"),
    }),
    deleteRdfFile
  );
};

const rdfFileId = computed(() => props.rdfFile?.id);

const handleDownload = async () => {
  const { error } = await $downloadRdfFile(rdfFileId.value);
  if (error.value) {
    toaster.error(t("error.while_downloading", { item: rdfFileName.value }));
  }
};

const handleDownloadPublished = async () => {
  const { error } = await $downloadPublishedRdfFile(rdfFileId.value);
  if (error.value) {
    toaster.error(t("error.while_downloading", { item: rdfFileName.value }));
  }
};

const rdfFileDropdownItems = computed<MenuDropdownItems>(() => [
  {
    label: t("rdf_item.actions.edit"),
    iconClass: "fa-solid fa-pen-to-square",
    onClick: handleEdit,
  },
  {
    label: t("rdf_item.actions.delete"),
    iconClass: "fa-solid fa-trash-can",
    onClick: showDeleteConfirmationModal,
  },
  {
    isDivider: true,
  },
  {
    label: t("rdf_item.actions.preview_file"),
    iconClass: "fa-solid fa-eye",
    isHidden: rdfFileName.value?.endsWith(".zip"),
    isDisabled: props.rdfFile.publishState.state === "PUBLISHED",
    dataBsToggle: "offcanvas",
    href: "#offcanvasRdf",
    onClick: handleViewRdf,
  },
  {
    label: t("rdf_item.actions.download_file"),
    iconClass: "fa-solid fa-download",
    isDisabled: props.rdfFile.publishState.state === "PUBLISHED",
    onClick: handleDownload,
  },
  { isDivider: true },
  {
    label: t("rdf_item.actions.preview_published"),
    iconClass: "fa-solid fa-eye",
    isHidden: rdfFileName.value?.endsWith(".zip"),
    isDisabled: props.rdfFile.publishState.state !== "PUBLISHED",
    dataBsToggle: "offcanvas",
    href: "#offcanvasRdf",
    onClick: handleViewPublishedRdf,
  },
  {
    label: t("rdf_item.actions.download_published"),
    iconClass: "fa-solid fa-download",
    isDisabled: props.rdfFile.publishState.state !== "PUBLISHED",
    onClick: handleDownloadPublished,
  },
]);
</script>

<style lang="scss" scoped>
.fa-ellipsis {
  top: 0;
}
</style>
