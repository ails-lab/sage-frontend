<template>
  <div
    ref="sidebarMenu"
    class="sidebar-menu"
    data-minimize-sizebar="sidebar-menu"
  >
    <MinimizeMenu v-if="datasetIsSelected" :sidebar-menu="sidebarMenu" />

    <!-- minimize button on the left side-->
    <div class="minimize-menu left">
      <NuxtLink
        class="second-stage"
        title="Minimize Sidebar Further"
        @click="secondStageClicked($event, sidebarMenu)"
      >
        <img class="button-mini" src="@images/ic-menu-chevron.svg" />
      </NuxtLink>
    </div>
    <!-- second-->
    <div class="col nav-second">
      <div class="content">
        <!-- wrap-->
        <div class="wrap">
          <!-- subsite-->
          <h1 class="subsite">SAGE {{ props.instanceName }}</h1>
          <!-- menu -->
          <ul class="navigation type">
            <li
              :class="{ selected: contentType === 'Dataset' }"
              @click="contentType = 'Dataset'"
            >
              <NuxtLink to="/data/dataset">
                {{ $t("sidebar_menu_content.dataset") }}
              </NuxtLink>
            </li>
            <li
              :class="{ selected: contentType === 'Catalog' }"
              @click="contentType = 'Catalog'"
            >
              <NuxtLink to="/data/catalog">
                {{ $t("sidebar_menu_content.catalogs") }}
              </NuxtLink>
            </li>
          </ul>
          <!-- deac-->
          <div class="desc">
            <p class="dataset">
              {{ $t(descriptionToken) }}
            </p>
          </div>
          <!-- form-->
          <div class="form search">
            <!-- <i class="ic-search fa-solid fa-magnifying-glass"></i>
            <input type="text" /> -->
            <div class="counter">
              {{ pagination.get(contentType)?.totalElements }}
              {{ $t(`sidebar_menu_content.${contentType.toLowerCase()}s`) }}
            </div>
            <!-- <ul class="formaction">
              <li>
                <a
                  class="sage-icon"
                  href="#"
                  data-toggle="tooltip"
                  title="Filter"
                  data-boundary="window"
                >
                  <i class="filter"></i>
                </a>
              </li>
            </ul> -->
          </div>
        </div>
        <!-- list -->
        <simplebar class="asset-list data-simplebar">
          <ul class="listing">
            <li
              v-for="item of listedItems.get(contentType)"
              :key="item.id"
              :class="{ selected: item.id === selectedDataset?.id }"
              @click="selectDataset(item.id)"
            >
              <NuxtLink>
                <div class="title item-title">{{ item.name }}</div>
                <div v-if="contentType === 'Catalog'" class="type">CATALOG</div>
                <div v-if="contentType === 'Dataset'" class="type">
                  {{ item.scope }}
                </div>
              </NuxtLink>
            </li>
          </ul>
        </simplebar>
        <!-- pagination-->
        <div
          v-if="pagination.get(contentType)?.totalPages > 1"
          class="pagination row"
        >
          <li
            class="col-md-2"
            :class="{
              'v-hidden': pagination.get(contentType)?.currentPage <= 1,
            }"
          >
            <NuxtLink @click.prevent="decreasePageNumber">
              <i class="fa-solid fa-angle-left"></i
            ></NuxtLink>
          </li>
          <li class="col-8">
            <div class="info">
              {{ $t("pagination.page") }}
              {{ pagination.get(contentType)?.currentPage || 1 }}
              {{ $t("pagination.of") }}
              {{ pagination.get(contentType)?.totalPages }}
            </div>
          </li>
          <li
            class="col-md-2"
            :class="{
              'v-hidden':
                pagination.get(contentType)?.currentPage >=
                pagination.get(contentType)?.totalPages,
            }"
          >
            <NuxtLink @click.prevent="increasePageNumber">
              <i class="fa-solid fa-angle-right"></i
            ></NuxtLink>
          </li>
        </div>
        <!-- button new-->
        <div class="asset-new">
          <a
            :href="'#' + newModalName.get(contentType)"
            data-bs-toggle="offcanvas"
            role="button"
            :aria-controls="newModalName.get(contentType)"
          >
            <i class="fa-solid fa-plus"></i>
            {{ $t(addNewItemToken) }}
          </a>
        </div>
        <!-- not selected-->
        <div v-if="!datasetIsSelected" class="notselected">
          <p
            class="text"
            v-html="
              $t(
                'sidebar_menu_content.' +
                  contentType.toLowerCase() +
                  '_not_selected'
              )
            "
          ></p>
          <img src="@images/ic-line-arrow.svg" />
        </div>
      </div>
    </div>
    <DatasetDetails v-if="datasetIsSelected" :type="contentType" />
  </div>
  <NewDatasetSidebar />
  <NewCatalogSidebar />
</template>

<script setup lang="ts">
import simplebar from "simplebar-vue";
import "simplebar-vue/dist/simplebar.min.css";
import { useSidebarDataStore } from "~/stores/sidebarData";

const props = defineProps({
  instanceName: {
    type: String,
    required: true,
  },
});

const { fetchMyDatasets, fetchMyCatalogs, selectNewDataset, getDatasetSchema } =
  useSidebarDataStore();
const {
  datasets,
  datasetPagination,
  catalogs,
  catalogPagination,
  selectedDataset,
} = storeToRefs(useSidebarDataStore());

const route = useRoute();
const contentType = ref<"Dataset" | "Catalog">("Dataset");
const newModalName = ref(new Map());
newModalName.value.set("Dataset", "offcanvasNewDataset");
newModalName.value.set("Catalog", "offcanvasNewCatalog");

const listedItems = ref(new Map());
const pagination = ref(new Map());
const nullDataset = ref<boolean>(false);
const sidebarMenu = ref<HTMLElement | null>(null);

const datasetIsSelected = computed(() => {
  return (
    selectedDataset.value &&
    Object.keys(selectedDataset.value).length &&
    !nullDataset.value
  );
});
const descriptionToken = computed(() => {
  return (
    "sidebar_menu_content." + contentType.value.toLowerCase() + "_description"
  );
});

onMounted(async () => {
  await nextTick();
  await getDatasets(1);
  await getCatalogs(1);
  // Set up menu-sidebar, based on the current path
  if (route.path.startsWith("/data/dataset")) {
    contentType.value = "Dataset";
  } else if (route.path.startsWith("/data/catalog")) {
    contentType.value = "Catalog";
  }
  // if inside a specific dataset/catalog page, fetch the resource
  const datasetPattern = /^\/data\/dataset\/[^/]+\/?$/;
  const catalogPattern = /^\/data\/catalog\/[^/]+\/?$/;
  if (datasetPattern.test(route.path) || catalogPattern.test(route.path)) {
    await selectDataset(route.path.split("/")[3]);
  }
});

const getDatasets = async (pageNumber: number) => {
  await fetchMyDatasets(pageNumber);
  listedItems.value.set("Dataset", datasets.value);
  pagination.value.set("Dataset", datasetPagination.value);
};

const getCatalogs = async (pageNumber: number) => {
  await fetchMyCatalogs(pageNumber);
  listedItems.value.set("Catalog", catalogs.value);
  pagination.value.set("Catalog", catalogPagination.value);
};

const selectDataset = (id: string) => {
  selectNewDataset(id)
    .then(async () => {
      nullDataset.value = false;
      if (selectedDataset.value.publishState.state === "PUBLISHED") {
        await getDatasetSchema(id);
      }
      navigateTo(`/data/${contentType.value.toLocaleLowerCase()}/${id}/`);
    })
    .catch((error) => {
      nullDataset.value = true;
      console.error(error);
    });
};

const addNewItemToken = computed(() => {
  return "sidebar_menu_content." + contentType.value.toLowerCase() + "_add";
});

const decreasePageNumber = async () => {
  if (pagination.value.get(contentType.value)?.currentPage === 1) return;

  if (contentType.value === "Dataset") {
    await getDatasets(--pagination.value.get(contentType.value).currentPage);
  } else if (contentType.value === "Catalog") {
    await getCatalogs(--pagination.value.get(contentType.value).currentPage);
  }
};
const increasePageNumber = async () => {
  if (
    pagination.value.get(contentType.value)?.currentPage ===
    pagination.value.get(contentType.value)?.totalPages
  )
    return;
  if (contentType.value === "Dataset") {
    await getDatasets(++pagination.value.get(contentType.value).currentPage);
  } else if (contentType.value === "Catalog") {
    await getCatalogs(++pagination.value.get(contentType.value).currentPage);
  }
};

watch(contentType, () => {
  selectNewDataset();
  localStorage.sidebar = "normal";

  // remove class
  sidebarMenu?.value?.classList.remove("collapsed");
  sidebarMenu?.value?.classList.remove("first");
  sidebarMenu?.value?.classList.remove("second");
  sidebarMenu?.value?.classList.remove("show");
});
watch(datasets, () => {
  listedItems.value.set("Dataset", datasets.value);
  pagination.value.set("Dataset", datasetPagination.value);
});
watch(catalogs, () => {
  listedItems.value.set("Catalog", catalogs.value);
  pagination.value.set("Catalog", catalogPagination.value);
});
</script>

<style lang="scss">
a {
  cursor: pointer;
}
.form .counter {
  margin-bottom: 20px;
}

.item-title {
  overflow-x: hidden;
  text-overflow: ellipsis;
}
</style>
