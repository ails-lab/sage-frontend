<template>
  <div v-if="fetchState === 'error'">
    <NullResourceMessage :type="'dataset'" />
  </div>
  <div v-else class="wrap">
    <ul id="myTab" class="nav nav-tabs" role="tablist">
      <li class="nav-item" role="presentation">
        <button
          id="import-tab"
          class="nav-link active"
          data-bs-toggle="tab"
          data-bs-target="#import"
          type="button"
          role="tab"
          aria-controls="import"
          aria-selected="true"
        >
          {{ $t("catalog_page.import") }}
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          id="annotate-tab"
          class="nav-link"
          data-bs-toggle="tab"
          data-bs-target="#annotate"
          type="button"
          role="tab"
          aria-controls="annotate"
          aria-selected="false"
        >
          {{ $t("catalog_page.annotate") }}
        </button>
      </li>
    </ul>
    <div id="myTabContent" class="tab-content">
      <div
        id="import"
        class="tab-pane fade show active"
        role="tabpanel"
        aria-labelledby="import-tab"
      >
        <div class="content">
          <div class="actionbar">
            <ul>
              <!-- <li>
                <a
                  ref="publishIcon"
                  class="sage-icon"
                  href="#"
                  data-toggle="tooltip"
                  :title="t('catalog_page.publish')"
                  data-boundary="window"
                >
                  <i class="publish"></i>
                </a>
              </li> -->
              <li>
                <MenuDropdown
                  id="dropdown-menu-more-import"
                  :items="dropdownItems"
                >
                  <template #icon>
                    <i class="more"></i>
                  </template>
                </MenuDropdown>
              </li>
            </ul>
          </div>
          <ul id="importTab" class="nav nav-tabs featurenav" role="tablist">
            <li
              class="nav-item"
              role="presentation"
              @click="contentType = 'mapping'"
            >
              <button
                id="mapping-tab"
                class="nav-link active"
                data-bs-toggle="tab"
                data-bs-target="#mapping"
                type="button"
                role="tab"
                aria-controls="mapping"
                aria-selected="true"
              >
                {{ $t("dataset_page.mappings") }}
                <span class="counter">
                  {{ mappings?.length ?? 0 }}
                </span>
              </button>
            </li>
            <li
              class="nav-item"
              role="presentation"
              @click="contentType = 'rdf_data_file'"
            >
              <button
                id="rdf-tab"
                class="nav-link"
                data-bs-toggle="tab"
                data-bs-target="#rdf"
                type="button"
                role="tab"
                aria-controls="rdf"
                aria-selected="false"
              >
                {{ $t("dataset_page.rdf_data_file") }}
                <span class="counter">
                  {{ rdfFiles?.length ?? 0 }}
                </span>
              </button>
            </li>
            <li
              class="nav-item"
              role="presentation"
              @click="contentType = 'index'"
            >
              <button
                id="indices-tab"
                class="nav-link"
                data-bs-toggle="tab"
                data-bs-target="#indices"
                type="button"
                role="tab"
                aria-controls="indices"
                aria-selected="false"
              >
                {{ $t("dataset_page.indices") }}
                <span class="counter">
                  {{ selectedDataset.indices?.length ?? 0 }}
                </span>
              </button>
            </li>
            <li
              class="nav-item"
              role="presentation"
              @click="contentType = 'user_task'"
            >
              <button
                id="usertask-tab"
                class="nav-link"
                data-bs-toggle="tab"
                data-bs-target="#usertask"
                type="button"
                role="tab"
                aria-controls="usertask"
                aria-selected="false"
              >
                {{ $t("dataset_page.user_tasks") }}
                <span class="counter">
                  {{ selectedDataset.userTasks?.length ?? 0 }}
                </span>
              </button>
            </li>
            <li class="nav-action">
              <a
                :href="`#${actionSidebars.get(contentType)}`"
                data-bs-toggle="offcanvas"
                role="button"
                :aria-controls="actionSidebars.get(contentType)"
                @click="
                  handleOpenRdfDocument(
                    selectedRdfFile?.publishState.state === 'PUBLISHED'
                  )
                "
              >
                <i class="fa-solid fa-plus"></i>
                <span>
                  {{
                    $t("dataset_page.add", {
                      item: $t("dataset_page." + contentType),
                    })
                  }}
                </span>
              </a>
            </li>
          </ul>
          <div id="importTabContent" class="tab-content">
            <div
              id="mapping"
              class="tab-pane fade show active"
              role="tabpanel"
              aria-labelledby="mapping-tab"
            >
              <NoContentFound
                v-if="!mappings.length"
                :text="$t('dataset_page.mappings_description')"
                :action-h-ref="'#offcanvasAddMapping'"
                :action-text="
                  $t('dataset_page.add_now', {
                    item: $t('dataset_page.mapping'),
                  })
                "
              />
              <div v-else class="assetlist mapping">
                <li v-for="mapping of mappings" :key="'mapping-' + mapping.id">
                  <MappingDetailsBlock :mapping="mapping" />
                </li>
              </div>
            </div>
            <div
              id="rdf"
              class="tab-pane fade"
              role="tabpanel"
              aria-labelledby="rdf-tab"
            >
              <NoContentFound
                v-if="!rdfFiles?.length"
                :text="$t('dataset_page.rdf_files_description')"
                :action-h-ref="'#offcanvasAddRdf'"
                :action-text="
                  $t('dataset_page.add_now', {
                    item: $t('dataset_page.rdf_data_file'),
                  })
                "
              />
              <div v-else class="assetlist mapping">
                <li v-for="rdfFile of rdfFiles" :key="'rdfFile-' + rdfFile.id">
                  <RdfDataFileBlock
                    :rdf-file="rdfFile"
                    @open-rdf-document="handleOpenRdfDocument"
                    @edit="handleEditRdf"
                  />
                </li>
              </div>
            </div>
            <div
              id="indices"
              class="tab-pane fade"
              role="tabpanel"
              aria-labelledby="indices-tab"
            >
              <NoContentFound
                v-if="!selectedDataset.indices?.length"
                :text="$t('dataset_page.indices_description')"
                :action-h-ref="'#offcanvasAddIndex'"
                :action-text="
                  $t('dataset_page.add_now', {
                    item: $t('dataset_page.index'),
                  })
                "
              />
              <div v-else></div>
            </div>
            <div
              id="usertask"
              class="tab-pane fade"
              role="tabpanel"
              aria-labelledby="usertask-tab"
            >
              <NoContentFound
                v-if="!selectedDataset.userTasks?.length"
                :text="$t('dataset_page.user_tasks_description')"
                :action-h-ref="'#offcanvasAddTask'"
                :action-text="
                  $t('dataset_page.add_now', {
                    item: $t('dataset_page.user_task'),
                  })
                "
              />
              <template v-else>
                <ul class="assetlist user-task">
                  <li
                    v-for="userTask of selectedDataset.userTasks"
                    :key="userTask.id"
                  >
                    <UserTaskDetailsBlock :user-task="userTask" />
                  </li>
                </ul>
              </template>
            </div>
          </div>
        </div>
      </div>
      <div
        id="annotate"
        class="tab-pane fade"
        role="tabpanel"
        aria-labelledby="annotate-tab"
      >
        <div class="content">
          <div class="actionbar">
            <ul>
              <li>
                <a
                  ref="copyToClipboardIcon"
                  href="#offcanvasExportAnnotations"
                  data-bs-toggle="offcanvas"
                  data-toggle="tooltip"
                  :title="t('dataset_page.copy_annotations')"
                  data-boundary="window"
                >
                  <i class="fa-regular fa-clipboard"></i>
                </a>
              </li>
            </ul>
          </div>
          <div
            v-if="republishAlertCondition"
            class="alert alert-light alert-dismissible fade show"
          >
            <div class="alert-ic">
              <img class="ic" src="@images/ic-info-blue.svg" />
            </div>
            <span class="alert-message">
              {{ $t("dataset_schema.unpublished_changes_alert") }}
            </span>
            <button
              class="btn-close"
              data-bs-dismiss="alert"
              aria-label="Close"
            ></button>
          </div>
          <div
            v-if="datasetIsUnpublished"
            class="empty-result mt-3 text-center"
          >
            <p>
              {{ $t("dataset_page.no_mappings") }}
              <br />
              {{ $t("dataset_page.import_publish_mapping") }}
            </p>
          </div>
          <DatasetSchema v-else @add-annotator="handleAddAnnotator" />
        </div>
      </div>
    </div>
  </div>
  <NewAnnotatorSidebar
    :on-class="onClassParam"
    :on-property="onPropertyParam"
  />
  <NewMappingSidebar target="dataset" />
  <NewRdfSidebar
    :rdf-to-edit="selectedRdfFile"
    @close="selectedRdfFile = undefined"
  />
  <AddMappingInstanceSidebar />
  <AddIndexSidebar />
  <NewUserTaskSidebar />
  <DocumentD2rmlSidebar />
  <DocumentRdfSidebar
    :rdf-file="selectedRdfFile"
    :is-published="selectedRdfIsPublished"
    @close="selectedRdfFile = undefined"
  />
  <AttachSourceDataFileSidebar />
  <SparqlEditorSidebar />
  <PreviewAnnotationsSidebar />
  <PreviewExecutionSidebar />
  <ValidationSidebar :dataset="selectedDataset" />
  <ViewDatasetDescriptionSidebar v-if="selectedDataset?.id" />
</template>

<script setup lang="ts">
import { useDatasetDropdownOperations } from "./useDatasetDropdownOperations";
import type { RdfDataFile } from "@/types/RdfDataFile";

const { t } = useI18n();

const { $bootstrap } = useNuxtApp();
const { fetchState, selectedDataset } = storeToRefs(useSidebarDataStore());

const { dropdownItems } = useDatasetDropdownOperations();

const contentType = ref<"mapping" | "rdf_data_file" | "index" | "user_task">(
  "mapping"
);
// const publishIcon = ref(null);
const copyToClipboardIcon = ref(null);
const selectedRdfFile = ref<RdfDataFile>();
const selectedRdfIsPublished = ref<boolean | undefined>(false);
const onClassParam = ref<string>("");
const onPropertyParam = ref<string>("");
const actionSidebars = ref(new Map());
actionSidebars.value.set("mapping", "offcanvasAddMapping");
actionSidebars.value.set("rdf_data_file", "offcanvasAddRdf");
actionSidebars.value.set("index", "offcanvasAddIndex");
actionSidebars.value.set("user_task", "offcanvasAddTask");

const mappings = computed(() => {
  return selectedDataset.value.mappings || [];
});

const republishAlertCondition = computed(() => {
  if (!selectedDataset.value.mappings) return false;
  for (const mapping of selectedDataset.value?.mappings) {
    if (!mapping.active) continue;
    for (const instance of mapping.instances) {
      if (
        instance.executeState.state === "EXECUTED" &&
        instance.publishState.state === "UNPUBLISHED"
      )
        return true;

      if (
        instance.publishState.state === "PUBLISHED" &&
        instance.publishState.completedAt &&
        instance.executeState.completedAt &&
        new Date(instance.publishState.completedAt) <
          new Date(instance.executeState.completedAt)
      )
        return true;
    }
  }
  return false;
});

const rdfFiles = computed(() => selectedDataset.value.rdfFiles || []);

const datasetIsUnpublished = computed(
  () => selectedDataset.value.publishState?.state !== "PUBLISHED"
);

onMounted(() => {
  if (fetchState.value === "success") {
    // new $bootstrap.Tooltip(publishIcon.value!, { trigger: "hover" });
    new $bootstrap.Tooltip(copyToClipboardIcon.value!, { trigger: "hover" });
  }
});

const handleEditRdf = (rdfFile: RdfDataFile) => {
  selectedRdfFile.value = rdfFile;
  showCanvasById("offcanvasAddRdf");
};

const handleOpenRdfDocument = (isPublished: boolean, rdfFile?: RdfDataFile) => {
  selectedRdfFile.value = rdfFile;
  selectedRdfIsPublished.value = isPublished;
};

const handleAddAnnotator = (data: { onClass: any; onProperty: any }) => {
  onClassParam.value = data.onClass;
  onPropertyParam.value = data.onProperty;
  showCanvasById("offcanvasNewAnnotator");
};
</script>

<style lang="scss" scoped>
.nav-action {
  max-width: 196px;
}

.assetlist.mapping {
  overflow: auto;
  height: calc(100vh - 278px);
  width: 100%;
}
.assetlist.user-task {
  overflow: auto;
  height: calc(100vh - 278px);
  width: 100%;
}

#annotate {
  height: calc(100vh - 145px);
  overflow-y: auto;
}
</style>
