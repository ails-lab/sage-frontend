<template>
  <div class="col nav-third">
    <div class="content">
      <div class="wrap">
        <div class="info-detail">
          <h2 class="dataset-title">{{ selectedDataset.name }}</h2>
          <span class="type">
            {{
              selectedDataset.type === "CATALOG"
                ? selectedDataset.type
                : selectedDataset.scope
            }}
          </span>
        </div>
        <div v-if="currentUser.role === 'EDITOR'" class="actionbar">
          <ul>
            <li>
              <a
                ref="editIcon"
                class="sage-icon"
                :href="`#offcanvasNew${props.type}`"
                data-bs-toggle="offcanvas"
                role="button"
                :aria-controls="`offcanvasNew${props.type}`"
                data-toggle="tooltip"
                :title="`Edit ${props.type}`"
                data-boundary="window"
                @click="editClicked"
              >
                <i class="edit"></i>
              </a>
            </li>
            <li>
              <a
                v-if="selectedDataset.publishState?.state !== 'PUBLISHED'"
                ref="deleteIcon"
                class="sage-icon"
                data-toggle="tooltip"
                :title="`Delete ${props.type}`"
                data-boundary="window"
                @click="showDeleteConfirmationModal"
              >
                <i class="delete"></i>
              </a>
            </li>
            <li v-if="props.type === 'Dataset'">
              <a
                ref="addToCatalogIcon"
                href="#offcanvasAddDatasetToCatalogs"
                class="sage-icon"
                role="button"
                data-toggle="tooltip"
                data-bs-toggle="offcanvas"
                title="Add to Catalog"
                data-boundary="window"
                aria-controls="offcanvasAddDatasetToCatalogs"
              >
                <i class="folder"></i>
              </a>
            </li>
          </ul>
        </div>
        <simplebar class="asset-list data-simplebar">
          <div class="info-meta">
            <div class="field">
              <div class="title">UUID</div>
              <div class="value">{{ selectedDataset.uuid }}</div>
            </div>
          </div>
          <div class="info-meta">
            <div class="field">
              <div class="title">{{ $t("dataset_details.status") }}</div>
              <div class="value capitalized-value">
                {{
                  $t(
                    `state.publish.${selectedDataset.publishState?.state?.toLowerCase()}`
                  )
                }}
              </div>
            </div>
            <div class="field">
              <div class="title">{{ $t("dataset_details.visibility") }}</div>
              <div class="value capitalized-value">
                {{ selectedDataset.public ? "Public" : "Private" }}
              </div>
            </div>
            <div class="field">
              <div class="title">{{ $t("dataset_details.load") }}</div>
              <div class="value capitalized-value">
                {{
                  selectedDataset.loadState?.state === "NOT_LOADED"
                    ? "Not Loaded"
                    : "Loaded"
                }}
              </div>
            </div>
          </div>
          <div class="info-meta">
            <div class="field">
              <div class="title">{{ $t("dataset_details.mappings") }}</div>
              <div class="value">
                {{
                  selectedDataset.mappings ? selectedDataset.mappings.length : 0
                }}
              </div>
            </div>
            <template v-if="props.type === 'Dataset'">
              <div class="field">
                <div class="title">{{ $t("dataset_details.indices") }}</div>
                <div class="value">
                  {{
                    selectedDataset.indices ? selectedDataset.indices.length : 0
                  }}
                </div>
              </div>
              <div class="field">
                <div class="title">{{ $t("dataset_details.user_tasks") }}</div>
                <div class="value">
                  {{
                    selectedDataset.userTasks
                      ? selectedDataset.userTasks.length
                      : 0
                  }}
                </div>
              </div>
              <div class="field">
                <div class="title">
                  {{ $t("dataset_details.distributions") }}
                </div>
                <div class="value">
                  {{
                    selectedDataset.distributions
                      ? selectedDataset.distributions.length
                      : 0
                  }}
                </div>
              </div>
              <div class="field">
                <div class="title">{{ $t("dataset_details.rdf_files") }}</div>
                <div class="value">
                  {{
                    selectedDataset.rdfFiles
                      ? selectedDataset.rdfFiles.length
                      : 0
                  }}
                </div>
              </div>
            </template>
          </div>
        </simplebar>
      </div>
    </div>
    <AddDatasetToCatalogsSidebar
      v-if="props.type === 'Dataset' && datasetFetched"
    />
  </div>
</template>

<script setup lang="ts">
import simplebar from "simplebar-vue";
import "simplebar-vue/dist/simplebar.min.css";
import { useSidebarDataStore } from "~/stores/sidebarData";
import { useAuthStore } from "~/stores/auth";

const { $bootstrap } = useNuxtApp();
const { t } = useI18n();
const { showConfirmModal } = useModalsStore();
const { currentUser } = storeToRefs(useAuthStore());
const { fetchMyCatalogs, fetchMyDatasets, selectNewDataset } =
  useSidebarDataStore();
const { selectedDataset, editDatasetClicked } = storeToRefs(
  useSidebarDataStore()
);
const props = defineProps({
  type: {
    type: String,
    required: true,
  },
});
const deleteIcon = ref(null);
const editIcon = ref(null);
const addToCatalogIcon = ref(null);

const datasetFetched = computed(() => {
  return !!selectedDataset.value?.id;
});

onMounted(() => {
  // Attach tooltips
  if (props.type === "Dataset") {
    new $bootstrap.Tooltip(addToCatalogIcon.value!, { trigger: "hover" });
  }
  if (selectedDataset.value.publishState?.state !== "PUBLISHED") {
    new $bootstrap.Tooltip(deleteIcon.value!, { trigger: "hover" });
  }
  new $bootstrap.Tooltip(editIcon.value!, { trigger: "hover" });
});

const editClicked = () => {
  const offCanvasDataset = document.getElementById("offcanvasNewDataset");
  const offCanvasCatalog = document.getElementById("offcanvasNewCatalog");
  if (
    offCanvasDataset?.classList.contains("show") ||
    offCanvasCatalog?.classList.contains("show")
  ) {
    editDatasetClicked.value = false;
  } else {
    editDatasetClicked.value = true;
  }
};

const showDeleteConfirmationModal = () => {
  showConfirmModal(
    t("confirm_delete_this_item", { itemToDelete: props.type }),

    deleteDataset
  );
};

const deleteDataset = async () => {
  const { $deleteDataset } = useNuxtApp();
  const { error } = await $deleteDataset(selectedDataset.value.id);
  if (error.value) {
    console.error(error.value.message);
    return;
  }
  await navigateTo(`/data/${props.type?.toLowerCase()}`);
  if (props.type === "Catalog") {
    await fetchMyCatalogs(1);
  } else if (props.type === "Dataset") {
    await fetchMyDatasets(1);
  }
  selectNewDataset();
};
</script>

<style scoped>
.asset-list {
  overflow: auto;
  height: calc(100vh - 235px);
  width: 100%;
}
.dataset-title {
  overflow-x: hidden;
  text-overflow: ellipsis;
}
.capitalized-value {
  text-transform: capitalize;
}
</style>
