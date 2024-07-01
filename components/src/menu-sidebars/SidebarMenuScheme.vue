<template>
  <div
    ref="sidebarMenu"
    class="sidebar-menu"
    data-minimize-sizebar="sidebar-menu"
  >
    <MinimizeMenu v-if="schemeIsSelected" :sidebar-menu="sidebarMenu" />

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
          <div class="navigation type">
            <select
              v-model="selectedSchemeType"
              class="selected"
              @change="
                changeSchemeType(($event.target as HTMLSelectElement)?.value)
              "
            >
              <option
                v-for="schemeType of schemeTypes"
                :key="'scheme-type-' + schemeType"
                :value="schemeType"
              >
                {{ $t(`sidebar_menu_scheme.scheme_types.${schemeType}`) }}
              </option>
            </select>
          </div>
          <div class="desc">
            <p class="dataset">
              {{ $t(`sidebar_menu_scheme.description.${selectedSchemeType}`) }}
            </p>
          </div>
          <!-- form-->
          <div class="form search">
            <!-- <i class="ic-search fa-solid fa-magnifying-glass"></i>
            <input type="text" /> -->
            <div class="counter">
              {{ pagination.get(selectedSchemeType)?.totalElements }}
              {{ $t("sidebar_menu_scheme.schemata") }}
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
              v-for="scheme of listedItems.get(selectedSchemeType)"
              :key="scheme.id"
              :class="{ selected: scheme.id === selectedScheme?.id }"
              @click="selectScheme(scheme.id)"
            >
              <NuxtLink>
                <div class="title">{{ scheme.name }}</div>
                <div class="type">{{ scheme.scope }}</div>
              </NuxtLink>
            </li>
          </ul>
        </simplebar>
        <!-- pagination-->
        <div
          v-if="pagination.get(selectedSchemeType)?.totalPages > 1"
          class="pagination row"
        >
          <li
            class="col-md-2"
            :class="{
              'v-hidden': pagination.get(selectedSchemeType)?.currentPage <= 1,
            }"
          >
            <NuxtLink @click.prevent="decreasePageNumber">
              <i class="fa-solid fa-angle-left"></i
            ></NuxtLink>
          </li>
          <li class="col-8">
            <div class="info">
              {{ $t("pagination.page") }}
              {{ pagination.get(selectedSchemeType)?.currentPage || 1 }}
              {{ $t("pagination.of") }}
              {{ pagination.get(selectedSchemeType)?.totalPages }}
            </div>
          </li>
          <li
            class="col-md-2"
            :class="{
              'v-hidden':
                pagination.get(selectedSchemeType)?.currentPage >=
                pagination.get(selectedSchemeType)?.totalPages,
            }"
          >
            <NuxtLink @click.prevent="increasePageNumber">
              <i class="fa-solid fa-angle-right"></i
            ></NuxtLink>
          </li>
        </div>
        <!-- button new-->
        <div v-if="isAddImplemented" class="asset-new">
          <a
            :href="'#' + newModalName.get(selectedSchemeType)"
            data-bs-toggle="offcanvas"
            role="button"
          >
            <i class="fa-solid fa-plus"></i>
            {{ $t(`sidebar_menu_scheme.add.${selectedSchemeType}`) }}
          </a>
        </div>
        <!-- not selected-->
        <div v-if="!schemeIsSelected" class="notselected scheme">
          <p
            class="text"
            v-html="
              $t(`sidebar_menu_scheme.not_selected.${selectedSchemeType}`)
            "
          ></p>
          <img src="@images/ic-line-arrow.svg" />
        </div>
      </div>
    </div>
    <SchemeDetails v-if="schemeIsSelected" :type="selectedSchemeType" />
  </div>

  <DocumentD2rmlSidebar />
  <NewIndexSidebar />
  <NewSchemeSidebar :type="selectedSchemeType" />
  <AddSchemeFileSidebar :type="selectedSchemeType" />
</template>

<script setup lang="ts">
import simplebar from "simplebar-vue";
import "simplebar-vue/dist/simplebar.min.css";
import { useSidebarDataStore } from "~/stores/sidebarData";
import type { Dataset, SchemeType } from "@/types/Dataset";

const { fetchMySchemes, selectNewScheme } = useSidebarDataStore();
const { schemes, schemePagination, selectedScheme } = storeToRefs(
  useSidebarDataStore()
);

const props = defineProps({
  instanceName: {
    type: String,
    required: true,
  },
});

const route = useRoute();
const listedItems = ref(new Map());
const pagination = ref(new Map());
const nullScheme = ref<boolean>(false);
const schemeTypes = ref<SchemeType[]>([
  "d2rml",
  "shacl",
  "annotator",
  "comparator",
  "index",
]);
const selectedSchemeType = ref<SchemeType>("d2rml");
const sidebarMenu = ref<HTMLElement | null>(null);
const newModalName = ref(new Map());
newModalName.value.set("d2rml", "offcanvasNewd2rml");
newModalName.value.set("shacl", "offcanvasNewshacl");
newModalName.value.set("index", "offcanvasNewindex");

const isAddImplemented = computed(() =>
  ["d2rml", "shacl", "index"].includes(selectedSchemeType.value)
);

const schemeIsSelected = computed(() => {
  return (
    selectedScheme.value &&
    Object.keys(selectedScheme.value).length &&
    !nullScheme.value
  );
});

onMounted(async () => {
  await nextTick();

  // Set up menu-sidebar, based on the current path
  const typeRegex = /\/scheme\/(d2rml|shacl|annotator|comparator|index)\//;
  const typeMatch = route.path.match(typeRegex);
  selectedSchemeType.value = typeMatch ? typeMatch[1] : "d2rml";

  for (const type of schemeTypes.value) {
    await getSchemes(type, 1);
  }

  // If inside a specific dataset/catalog page, fetch the resource
  const idRegex =
    /\/scheme\/(?:d2rml|shacl|annotator|comparator|index)\/([a-zA-Z0-9]+)/;
  const idMatch = route.path.match(idRegex);
  if (idMatch) {
    await selectScheme(route.path.split("/")[3]);
  }
});

const getSchemes = async (type: SchemeType, pageNumber: number) => {
  await fetchMySchemes(type, pageNumber);
  listedItems.value.set(type, schemes.value[type]);
  pagination.value.set(type, schemePagination.value[type]);
};

const selectScheme = (id: string) => {
  selectNewScheme(id, selectedSchemeType.value)
    .then(() => {
      nullScheme.value = false;
      navigateTo(`/scheme/${selectedSchemeType.value}/${id}/`);
    })
    .catch((error) => {
      nullScheme.value = true;
      console.error(error);
    });
};

const changeSchemeType = (type: SchemeType) => {
  selectedSchemeType.value = type;
  navigateTo(`/scheme/${type}/`);
};

const decreasePageNumber = () => {
  if (pagination.value.get(selectedSchemeType.value)?.currentPage === 1) {
    return;
  }
  getSchemes(
    selectedSchemeType.value,
    --pagination.value.get(selectedSchemeType.value).currentPage
  );
};

const increasePageNumber = () => {
  if (
    pagination.value.get(selectedSchemeType.value)?.currentPage ===
    pagination.value.get(selectedSchemeType.value)?.totalPages
  ) {
    return;
  }
  getSchemes(
    selectedSchemeType.value,
    ++pagination.value.get(selectedSchemeType.value).currentPage
  );
};

watch(schemes.value, () => {
  listedItems.value.set(
    selectedSchemeType.value,
    schemes.value[selectedSchemeType.value]
  );
  pagination.value.set(
    selectedSchemeType.value,
    schemePagination.value[selectedSchemeType.value]
  );
});

watch(selectedSchemeType, () => {
  selectedScheme.value = {} as Dataset;
  localStorage.sidebar = "normal";
  // remove class
  sidebarMenu?.value?.classList.remove("collapsed");
  sidebarMenu?.value?.classList.remove("first");
  sidebarMenu?.value?.classList.remove("second");
  sidebarMenu?.value?.classList.remove("show");
});
</script>

<style lang="scss">
a {
  cursor: pointer;
}
.form .counter {
  margin-bottom: 20px;
}
</style>
