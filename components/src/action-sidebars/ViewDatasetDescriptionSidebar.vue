<template>
  <ActionSidebar
    id="offcanvasViewDatasetDescription"
    ref="viewDatasetDescriptionCanvas"
  >
    <ActionSidebarHeader
      :title="$t('dataset_page.view_dataset_description')"
      @close="closeSidebar"
    >
      <template #description>
        <div class="offcanvas-stats">
          <ul>
            <li>
              <div class="lbl">
                {{ $t("code_sidebar.created") }}
              </div>
              <div class="value">
                {{ dateStamp(selectedDataset?.createdAt) }}
              </div>
            </li>
            <li>
              <div class="lbl">{{ $t("code_sidebar.last_modified") }}</div>
              <div class="value">
                {{ dateStamp(selectedDataset?.updatedAt) }}
              </div>
            </li>
          </ul>
        </div>
      </template>
    </ActionSidebarHeader>
    <ActionSidebarBody>
      <CodeBlock :document-text="initialDocumentText" :is-read-only="true" />
    </ActionSidebarBody>
  </ActionSidebar>
</template>

<script setup lang="ts">
const { $getDatasetRdfFile } = useNuxtApp();

const { selectedDataset } = storeToRefs(useSidebarDataStore());
const emit = defineEmits(["close"]);

const initialDocumentText = ref("");

const getRdfSchema = async (id: string) => {
  const { data, error }: any = await $getDatasetRdfFile(id);

  if (error.value) {
    initialDocumentText.value = "";
  } else {
    initialDocumentText.value = data?.value || "";
  }
};

onMounted(() => {
  getRdfSchema(selectedDataset.value.id);
});

const viewDatasetDescriptionCanvas = ref();
const closeSidebar = () => {
  emit("close");
  hideOffcanvas(viewDatasetDescriptionCanvas);
};
</script>
