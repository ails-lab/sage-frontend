<template>
  <ActionSidebar id="offcanvasAddDatasets" ref="addDatasetsCanvas">
    <ActionSidebarHeader
      :title="`${$t('add_datasets_sidebar.title')} ${camelcaseString(
        props.target,
        ' '
      )}`"
      :description="`${$t('add_datasets_sidebar.description')} ${props.target}`"
      @close="fetchSelectedItem"
    />
    <ActionSidebarBody id="dataset-list">
      <div class="activity">
        <div class="filter-section">
          <span class="stat space">
            <strong>{{ noOfDatasetsSelected }}</strong>
            {{ $t("add_datasets_sidebar.datasets_selected") }}
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
              {{ $t("add_datasets_sidebar.dataset_title") }}
            </div>
            <div class="col-2">
              {{ $t("add_datasets_sidebar.dataset_type") }}
            </div>
            <div class="col-2">
              {{ $t("add_datasets_sidebar.dataset_visibility") }}
            </div>
            <div class="col-2">
              {{ $t("add_datasets_sidebar.publish_date") }}
            </div>
          </div>
        </div>
        <div class="list-asset">
          <div
            v-for="dataset of datasets"
            :key="'dataset-' + dataset.id"
            class="row entry"
          >
            <AddIconButton
              :is-added="isDatasetSelected(dataset)"
              @toggle="toggleSelected(dataset)"
            />
            <div class="col-5">
              {{ dataset.name }}
            </div>
            <div class="col-2">
              {{ dataset.scope }}
            </div>
            <div class="col-2">
              {{ dataset.public ? "PUBLIC" : "PRIVATE" }}
            </div>
            <div class="col-2">
              {{
                dataset.publishState.state === "PUBLISHED"
                  ? dateStamp(dataset.publishState.completedAt)
                  : "-"
              }}
            </div>
          </div>
        </div>
        <div class="pagination row">
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
const route = useRoute();
const { toaster } = useToaster();

const { selectedDataset, selectedCampaign } = storeToRefs(
  useSidebarDataStore()
);
const { selectNewCampaign, selectNewDataset } = useSidebarDataStore();
const {
  $getMyCollections,
  $addDatasetToCatalog,
  $removeDatasetFromCatalog,
  $addDatasetToCampaign,
  $removeDatasetFromCampaign,
} = useNuxtApp();

const props = defineProps({
  target: {
    type: String,
    required: true,
  },
});

const addDatasetsCanvas = ref();
const datasets = ref<Dataset[]>([]);
const pagination = ref<Pagination>({} as Pagination);
const selected = ref<string[]>([]);
const visited = ref<number[]>([]);
const noOfDatasetsSelected = ref<number>(0);

onMounted(async () => {
  if (props.target === "catalog" && selectedDataset.value.datasets)
    noOfDatasetsSelected.value = selectedDataset.value.datasets.length;
  else if (props.target === "campaign" && selectedCampaign.value.datasets)
    noOfDatasetsSelected.value = selectedCampaign.value?.datasets.length;
  await getMyCollectionDatasets(1);
});

const getMyCollectionDatasets = async (page: number) => {
  const { data, error } = await $getMyCollections(page);
  if (error.value) {
    console.error(error.value);
  }
  datasets.value = data.value.data;
  pagination.value = data.value.pagination;

  if (visited.value.includes(page)) return;
  if (props.target === "catalog" && selectedDataset.value.datasets) {
    selected.value = selected.value.concat(
      selectedDataset.value.datasets
        .filter((d) => datasets.value.some(({ id }) => d.id === id))
        .map((d) => d.id)
    );
  } else if (props.target === "campaign" && selectedCampaign.value.datasets) {
    selected.value = selected.value.concat(
      selectedCampaign.value.datasets
        .filter((d) => datasets.value.some(({ id }) => d.id === id))
        .map((d) => d.id)
    );
  }
  visited.value.push(page);
};

const fetchSelectedItem = async () => {
  if (props.target === "catalog") await fetchSelectedDataset();
  else if (props.target === "campaign")
    await selectNewCampaign(selectedCampaign.value.id);
};

const fetchSelectedDataset = () => {
  selectNewDataset(selectedDataset.value.id).catch((error) =>
    console.error(error)
  );
};

const isDatasetSelected = (dataset: Dataset): boolean => {
  return selected.value.includes(dataset.id);
};

const toggleSelected = async (dataset: Dataset) => {
  // add dataset functions
  if (!isDatasetSelected(dataset)) {
    if (props.target === "catalog") {
      await addDatasetToCatalog(dataset);
    } else if (props.target === "campaign") {
      await addDatasetToCampaign(dataset);
    }
    noOfDatasetsSelected.value++;
    return;
  }

  // remove dataset functions
  if (props.target === "catalog") {
    await removeDatasetFromCatalog(dataset);
  } else if (props.target === "campaign") {
    await removeDatasetFromCampaign(dataset);
  }
  noOfDatasetsSelected.value--;
};

const addDatasetToCatalog = async (dataset: Dataset) => {
  const { error } = await $addDatasetToCatalog(
    selectedDataset.value.id,
    dataset.id
  );
  if (error.value) {
    toaster.error(
      `${t("add_datasets_sidebar.error_toast")} ${t(
        "add_datasets_sidebar.with_message"
      )} ${error.value.data.message} `
    );
  } else {
    toaster.success(t("add_datasets_sidebar.success_add_toast") + props.target);
    selected.value.push(dataset.id);
  }
};

const removeDatasetFromCatalog = async (dataset: Dataset) => {
  const { error } = await $removeDatasetFromCatalog(
    selectedDataset.value.id,
    dataset.id
  );
  if (error.value) {
    toaster.error(
      `${t("add_datasets_sidebar.error_toast")} ${t(
        "add_datasets_sidebar.with_message"
      )} ${error.value.data.message} `
    );
  } else {
    toaster.success(
      t("add_datasets_sidebar.success_remove_toast") + props.target
    );
    const index = selected.value.indexOf(dataset.id);
    if (index !== -1) {
      selected.value.splice(index, 1);
    }
  }
};

const addDatasetToCampaign = async (dataset: Dataset) => {
  const { error } = await $addDatasetToCampaign(
    selectedCampaign.value.id,
    dataset.id
  );
  if (error.value) {
    toaster.error(
      `${t("add_datasets_sidebar.error_toast")} ${t(
        "add_datasets_sidebar.with_message"
      )} ${error.value.data.message} `
    );
  } else {
    toaster.success(t("add_datasets_sidebar.success_add_toast") + props.target);
    selected.value.push(dataset.id);
  }
};

const removeDatasetFromCampaign = async (dataset: Dataset) => {
  const { error } = await $removeDatasetFromCampaign(
    selectedCampaign.value.id,
    dataset.id
  );
  if (error.value) {
    toaster.error(
      `${t("add_datasets_sidebar.error_toast")} ${t(
        "add_datasets_sidebar.with_message"
      )} ${error.value.data.message} `
    );
  } else {
    toaster.success(
      t("add_datasets_sidebar.success_remove_toast") + props.target
    );
    const index = selected.value.indexOf(dataset.id);
    if (index !== -1) {
      selected.value.splice(index, 1);
    }
  }
};

const increasePage = () => {
  if (pagination.value.totalPages === pagination.value.currentPage) return;
  document.getElementById("dataset-list").scrollTop = 0;
  getMyCollectionDatasets(++pagination.value.currentPage);
};
const decreasePage = () => {
  if (pagination.value.currentPage === 1) return;
  document.getElementById("dataset-list").scrollTop = 0;
  getMyCollectionDatasets(--pagination.value.currentPage);
};
</script>
