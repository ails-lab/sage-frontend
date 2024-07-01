<template>
  <div v-if="fetchState === 'error'">
    <NullResourceMessage :type="'catalog'" />
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
              <li>
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
              </li>
              <li>
                <div class="dropdown">
                  <a
                    id="dropdown-menu-more-import"
                    class="sage-icon"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i class="more"></i>
                  </a>
                  <ul
                    class="dropdown-menu"
                    aria-labelledby="dropdown-menu-more-import"
                  >
                    <li>
                      <a class="dropdown-item" href="#">
                        <i class="fa-regular fa-pen-to-square"></i>
                        <span class="dropdown-text">
                          {{ $t("catalog_page.edit") }}
                        </span>
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#">
                        <i class="fa-regular fa-trash-can"></i>
                        <span class="dropdown-text">
                          {{ $t("catalog_page.delete") }}
                        </span>
                      </a>
                    </li>
                    <li>
                      <hr class="dropdown-divider" />
                    </li>
                    <li>
                      <a class="dropdown-item" href="#">
                        <i class="fa-regular fa-paper-plane"></i>
                        <span class="dropdown-text">
                          {{ $t("catalog_page.publish") }}
                        </span>
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#">
                        <i class="fa-regular fa-paper-plane"></i>
                        <span class="dropdown-text">
                          {{ $t("catalog_page.publish_unpublished") }}
                        </span>
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#">
                        <i class="fa-regular fa-paper-plane"></i>
                        <span class="dropdown-text">
                          {{ $t("catalog_page.republish_metadata") }}
                        </span>
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#">
                        <i class="fa-regular fa-rectangle-xmark"></i>
                        <span class="dropdown-text">
                          {{ $t("catalog_page.unpublish") }}
                        </span>
                      </a>
                    </li>
                    <li>
                      <hr class="dropdown-divider" />
                    </li>
                    <li>
                      <a
                        v-if="isPublished"
                        class="dropdown-item"
                        href="#offcanvasViewDatasetDescription"
                        data-bs-toggle="offcanvas"
                        role="button"
                      >
                        <img src="@images/ic-menu-user.svg" />
                        <span class="dropdown-text">
                          {{ $t("catalog_page.view_dataset_description") }}
                        </span>
                      </a>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </div>
          <ul id="importTab" class="nav nav-tabs featurenav" role="tablist">
            <li
              class="nav-item"
              role="presentation"
              @click="contentType = 'Datasets'"
            >
              <button
                id="rdf-tab"
                class="nav-link active"
                data-bs-toggle="tab"
                data-bs-target="#rdf"
                type="button"
                role="tab"
                aria-controls="rdf"
                aria-selected="false"
              >
                {{ $t("catalog_page.datasets") }}
                <span class="counter">{{ datasets.length }}</span>
              </button>
            </li>
            <li
              class="nav-item"
              role="presentation"
              @click="contentType = 'Mappings'"
            >
              <button
                id="mapping-tab"
                class="nav-link"
                data-bs-toggle="tab"
                data-bs-target="#mapping"
                type="button"
                role="tab"
                aria-controls="mapping"
                aria-selected="true"
              >
                {{ $t("catalog_page.mappings") }}
                <span class="counter">{{ mappings.length }}</span>
              </button>
            </li>
            <li class="nav-action">
              <ul>
                <li>
                  <a
                    :href="`#${actionSidebars.get(contentType)}`"
                    data-bs-toggle="offcanvas"
                    role="button"
                    :aria-controls="actionSidebars.get(contentType)"
                  >
                    <i class="fa-solid fa-plus"></i>
                    {{
                      $t("catalog_page.add_to_catalog", {
                        item: $t("catalog_page." + contentType.toLowerCase()),
                      })
                    }}
                  </a>
                </li>
              </ul>
            </li>
          </ul>
          <div id="importTabContent" class="tab-content">
            <div
              id="mapping"
              class="tab-pane fade"
              role="tabpanel"
              aria-labelledby="mapping-tab"
            >
              <NoContentFound
                v-if="!mappings.length"
                :text="$t('dataset_page.mappings_description')"
                :action-h-ref="'#offcanvasAddMapping'"
                :action-text="
                  $t('catalog_page.add_now', {
                    item: $t('catalog_page.mapping'),
                  })
                "
              />

              <ul v-else class="assetlist mapping">
                <li v-for="mapping of mappings" :key="'mapping-' + mapping.id">
                  <MappingDetailsBlock :mapping="mapping" />
                </li>
              </ul>
            </div>
            <div
              id="rdf"
              class="tab-pane fade show active"
              role="tabpanel"
              aria-labelledby="rdf-tab"
            >
              <NoContentFound
                v-if="!datasets.length"
                :text="$t('dataset_page.datasets_description')"
                :action-h-ref="'#offcanvasAddDatasets'"
                :action-text="
                  $t('catalog_page.add_now', {
                    item: $t('catalog_page.dataset'),
                  })
                "
              />
              <ul v-else class="assetlist datasets">
                <li
                  v-for="dataset of datasets"
                  :key="'dataset-' + dataset.id"
                  class="entry"
                >
                  <div class="row">
                    <div class="col-4 name">
                      <NuxtLink
                        :to="`/data/dataset/${dataset.id}/`"
                        target="_blank"
                        class="link-dataset"
                      >
                        {{ dataset.name }}
                      </NuxtLink>
                    </div>
                    <div class="col-4 text-truncate">
                      {{ datasetDateInfo(dataset) }}
                    </div>
                    <div class="col-3 text-truncate">
                      {{ dataset.public ? "Public" : "Private" }}
                    </div>
                    <div class="col-1">
                      <div class="actionbar">
                        <ul>
                          <li class="delete">
                            <a
                              data-toggle="tooltip"
                              title="Remove dataset"
                              data-boundary="window"
                              @click="removeDataset(dataset.id)"
                            >
                              <i class="remove fa-solid fa-xmark"></i>
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
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
                  class="sage-icon"
                  href="#"
                  data-toggle="tooltip"
                  title="Annotation Statistics"
                  data-boundary="window"
                >
                  <i class="stat"></i>
                </a>
              </li>
            </ul>
          </div>
          <div class="empty-result">
            <p>
              You have no published mapping. Rut laoreet dolore magna. <br />
              <a>
                Add and Published your mapping first to view Data Scheme and
                Start Annotating
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <AddDatasetsSidebar v-if="selectedDataset.id" target="catalog" />
  <NewMappingSidebar target="catalog" />
  <DocumentD2rmlSidebar />
  <LazyAttachSourceDataFileSidebar />
  <AddMappingInstanceSidebar />
  <PreviewExecutionSidebar />
  <ViewDatasetDescriptionSidebar v-if="selectedDataset?.id" />
</template>

<script setup lang="ts">
import { useSidebarDataStore } from "~/stores/sidebarData";
import type { Dataset } from "~/types/Dataset";

const { t } = useI18n();
const { toaster } = useToaster();
const { $bootstrap } = useNuxtApp();
const { fetchState, selectedDataset } = storeToRefs(useSidebarDataStore());
const { selectNewDataset } = useSidebarDataStore();
const { $removeDatasetFromCatalog } = useNuxtApp();

const contentType = ref<"Datasets" | "Mappings">("Datasets");
const publishIcon = ref(null);
const actionSidebars = ref(new Map());
actionSidebars.value.set("Datasets", "offcanvasAddDatasets");
actionSidebars.value.set("Mappings", "offcanvasAddMapping");

const datasets = computed(() => selectedDataset.value.datasets || []);
const mappings = computed(() => selectedDataset.value.mappings || []);

onMounted(() => {
  if (fetchState.value === "success") {
    new $bootstrap.Tooltip(publishIcon.value!, { trigger: "hover" });
  }
});

const isPublished = computed(
  () => selectedDataset.value?.publishState?.state === "PUBLISHED"
);

const datasetDateInfo = (dataset: Dataset): string => {
  if (dataset.createdAt) {
    return `Added on ${dateStamp(dataset.createdAt)}`;
  } else if (dataset.updatedAt) {
    return `Updated on ${dateStamp(dataset.updatedAt)}`;
  } else {
    return " - ";
  }
};

const removeDataset = async (datasetId: string) => {
  const { error }: any = await $removeDatasetFromCatalog(
    selectedDataset.value.id,
    datasetId
  );
  if (error.value) {
    toaster.error(t("add_datasets_sidebar.error_toast"));
  } else {
    toaster.success(t("add_datasets_sidebar.success_remove_toast"));
    selectNewDataset(selectedDataset.value.id).catch((error) =>
      console.error(error)
    );
  }
};
</script>

<style scoped lang="scss">
.nav-action li a {
  background-color: white !important;
  color: #ff9900 !important;
  &:hover {
    background-color: #ff9900 !important;
    color: white !important;
  }
}
.link-dataset:hover {
  text-decoration: underline !important;
}
.assetlist.mapping {
  overflow: auto;
  height: calc(100vh - 278px);
  width: 100%;
}
</style>
