<template>
  <ActionSidebar
    id="offcanvasAddDatasetToCatalogs"
    ref="addDatasetToCatalogCanvas"
  >
    <ActionSidebarHeader
      :title="$t('add_dataset_to_catalogs_sidebar.title')"
      :description="$t('add_dataset_to_catalogs_sidebar.description')"
      @close="fetchSelectedDataset"
    />
    <ActionSidebarBody id="catalog-list">
      <div class="activity">
        <div class="filter-section">
          <span class="stat space">
            <strong>{{ selected.length }}</strong>
            {{ $t("add_dataset_to_catalogs_sidebar.catalogs_selected") }}
          </span>
          <!--<div class="search">
            <i class="ic-search fa-solid fa-magnifying-glass"></i>
            <input class="form-control" type="text">
            <a class="sage-icon filter" href="#" data-toggle="tooltip" title="Filter" data-boundary="window">
              <i class="filter blue"></i>
            </a>
          </div>-->
        </div>
        <div class="list-heading">
          <div class="row">
            <div class="col-1"></div>
            <div class="col-5">
              {{ $t("add_dataset_to_catalogs_sidebar.catalog_title") }}
            </div>
            <div class="col-3">
              {{ $t("add_dataset_to_catalogs_sidebar.dataset_amount") }}
            </div>
            <div class="col-3">
              {{ $t("add_dataset_to_catalogs_sidebar.creation_date") }}
            </div>
          </div>
        </div>
        <div class="list-asset">
          <div
            v-for="catalog of catalogs"
            :key="'catalog-' + catalog.id"
            class="row entry"
          >
            <AddIconButton
              :is-added="isCatalogSelected(catalog)"
              @toggle="toggleSelected(catalog)"
            />
            <div class="col-5">
              {{ catalog.name }}
            </div>
            <div class="col-3">
              {{ catalog.datasets?.length ?? 0 }}
            </div>
            <div class="col-3">
              {{ catalog.createdAt ? dateStamp(catalog.createdAt) : "-" }}
            </div>
          </div>
        </div>
        <div v-if="pagination.totalPages > 1" class="pagination row">
          <li
            class="col-2"
            :class="{
              'v-hidden': pagination?.currentPage <= 1,
            }"
          >
            <NuxtLink @click.prevent="decreasePage">
              <i class="fa-solid fa-angle-left"></i>
            </NuxtLink>
          </li>
          <li class="col-4">
            <div class="info">
              {{ $t("pagination.page") }}
              {{ pagination.currentPage }} {{ $t("pagination.of") }}
              {{ pagination.totalPages }}
            </div>
          </li>
          <li
            class="col-2"
            :class="{
              'v-hidden': pagination?.currentPage >= pagination?.totalPages,
            }"
          >
            <NuxtLink @click.prevent="increasePage">
              <i class="fa-solid fa-angle-right"></i>
            </NuxtLink>
          </li>
        </div>
      </div>
    </ActionSidebarBody>
  </ActionSidebar>
</template>

<script setup lang="ts">
import { useSidebarDataStore } from "~/stores/sidebarData";
import type { Dataset } from "@/types/Dataset";
import type { Pagination } from "@/types/Pagination";

const { t } = useI18n();
const { toaster } = useToaster();

const { selectedDataset } = storeToRefs(useSidebarDataStore());
const { selectNewDataset } = useSidebarDataStore();

const { $getMyCatalogs, $addDatasetToCatalog, $removeDatasetFromCatalog } =
  useNuxtApp();

const addDatasetToCatalogCanvas = ref();
const catalogs = ref<Dataset[]>([]);
const pagination = ref<Pagination>({} as Pagination);
const selected = ref<string[]>([]);
const visited = ref<number[]>([]);

onMounted(async () => {
  await fetchMyCatalogs(1);
});

const fetchMyCatalogs = async (page: number) => {
  const { data, error } = await $getMyCatalogs(page);
  if (error.value) {
    console.error(error.value);
    return [];
  }
  catalogs.value = data.value.data;
  pagination.value = data.value.pagination;

  if (visited.value.includes(page)) return;
  selected.value = selected.value.concat(
    catalogs.value
      .filter((catalog) =>
        catalog.datasets?.some(
          (dataset) => dataset.id === selectedDataset.value.id
        )
      )
      .map((catalog) => catalog.id)
  );
  visited.value.push(page);
};

const fetchSelectedDataset = () => {
  selectNewDataset(selectedDataset.value.id).catch((error) =>
    console.error(error)
  );
};

const isCatalogSelected = (catalog: Dataset): boolean => {
  return selected.value.includes(catalog.id);
};

const toggleSelected = async (catalog: Dataset) => {
  if (!isCatalogSelected(catalog)) {
    await addDatasetToCatalog(catalog);
  } else {
    await removeDatasetFromCatalog(catalog);
  }
};

const addDatasetToCatalog = async (catalog: Dataset) => {
  const { error } = await $addDatasetToCatalog(
    catalog.id,
    selectedDataset.value.id
  );
  if (error.value) {
    toaster.error(t("add_datasets_sidebar.error_toast") + "Dataset");
  } else {
    toaster.success(t("add_datasets_sidebar.success_add_toast") + "Dataset");
    selected.value.push(catalog.id);
  }
};

const removeDatasetFromCatalog = async (catalog: Dataset) => {
  const { error } = await $removeDatasetFromCatalog(
    catalog.id,
    selectedDataset.value.id
  );
  if (error.value) {
    toaster.error(t("add_datasets_sidebar.error_toast") + "Dataset");
  } else {
    toaster.success(t("add_datasets_sidebar.success_remove_toast") + "Dataset");
    const index = selected.value.indexOf(catalog.id);
    if (index !== -1) {
      selected.value.splice(index, 1);
    }
  }
};

const increasePage = () => {
  if (pagination.value.totalPages === pagination.value.currentPage) return;
  document.getElementById("catalog-list").scrollTop = 0;
  fetchMyCatalogs(++pagination.value.currentPage);
};
const decreasePage = () => {
  if (pagination.value.currentPage === 1) return;
  document.getElementById("catalog-list").scrollTop = 0;
  fetchMyCatalogs(--pagination.value.currentPage);
};

watch(selectedDataset, () => {
  selected.value = [];
  visited.value = [];
  fetchMyCatalogs(1);
  hideOffcanvas(addDatasetToCatalogCanvas);
});
</script>
