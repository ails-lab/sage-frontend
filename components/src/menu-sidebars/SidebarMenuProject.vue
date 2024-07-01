<template>
  <div
    ref="sidebarMenu"
    class="sidebar-menu"
    data-minimize-sizebar="sidebar-menu"
  >
    <MinimizeMenu v-if="projectIsSelected" :sidebar-menu="sidebarMenu" />

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
              :class="{ selected: contentType === 'Created' }"
              @click="contentType = 'Created'"
            >
              <NuxtLink to="/project/created">
                {{ $t("sidebar_menu_project.created") }}
              </NuxtLink>
            </li>
            <li
              :class="{ selected: contentType === 'Joined' }"
              @click="contentType = 'Joined'"
            >
              <NuxtLink to="/project/joined">
                {{ $t("sidebar_menu_project.joined") }}
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
              {{ $t(`sidebar_menu_project.projects`) }}
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
              :class="{ selected: item.id === selectedProject?.id }"
              @click="contentType === 'Joined' ? null : selectProject(item.id)"
            >
              <NuxtLink>
                <div class="title item-title">{{ item.name }}</div>
                <div class="type">
                  {{ item.public ? "Public" : "Private" }}
                </div>
              </NuxtLink>
            </li>
          </ul>
        </simplebar>
        <!-- pagination-->
        <!-- <div
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
        </div> -->
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
        <div v-if="!projectIsSelected" class="notselected">
          <p
            class="text"
            v-html="
              $t(
                'sidebar_menu_project.' +
                  contentType.toLowerCase() +
                  '_not_selected'
              )
            "
          ></p>
          <img src="@images/ic-line-arrow.svg" />
        </div>
      </div>
    </div>
    <ProjectDetails
      v-if="contentType === 'Created' && projectIsSelected"
      :type="contentType"
    />
  </div>
  <NewProjectSidebar />
  <JoinProjectSidebar />
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

const { fetchMyProjects, fetchJoinedProjects, selectNewProject } =
  useSidebarDataStore();
const {
  myProjects,
  // myProjectsPagination,
  joinedProjects,
  // joinedProjectsPagination,
  selectedProject,
} = storeToRefs(useSidebarDataStore());

const route = useRoute();
const contentType = ref<"Created" | "Joined">("Created");
const newModalName = ref(new Map());
newModalName.value.set("Created", "offcanvasNewProject");
newModalName.value.set("Joined", "offcanvasJoinProject");

const listedItems = ref(new Map());
const pagination = ref(new Map());
const nullProject = ref<boolean>(false);
const sidebarMenu = ref<HTMLElement | null>(null);

const projectIsSelected = computed(() => {
  return (
    selectedProject.value &&
    Object.keys(selectedProject.value).length &&
    !nullProject.value
  );
});
const descriptionToken = computed(() => {
  return (
    "sidebar_menu_project." + contentType.value.toLowerCase() + "_description"
  );
});

onMounted(async () => {
  await nextTick();
  await getMyProjects(1);
  await getJoinedProjects(1);
  // Set up menu-sidebar, based on the current path
  if (route.path.startsWith("/project/created")) {
    contentType.value = "Created";
  } else if (route.path.startsWith("/project/joined")) {
    contentType.value = "Joined";
  }
  // if inside a specific created/joined page, fetch the resource
  const createdPattern = /^\/project\/created\/[^/]+\/?$/;
  const joinedPattern = /^\/project\/joined\/[^/]+\/?$/;
  if (createdPattern.test(route.path) || joinedPattern.test(route.path)) {
    await selectProject(route.path.split("/")[3]);
  }
});

const getMyProjects = async (pageNumber: number) => {
  await fetchMyProjects(pageNumber);
  listedItems.value.set("Created", myProjects.value);
  // pagination.value.set("Created", myProjectsPagination.value);
};

const getJoinedProjects = async (pageNumber: number) => {
  await fetchJoinedProjects(pageNumber);
  listedItems.value.set("Joined", joinedProjects.value);
  // pagination.value.set("Joined", joinedProjectsPagination.value);
};

const selectProject = (id: string) => {
  selectNewProject(id)
    .then(() => {
      nullProject.value = false;
      navigateTo(`/project/${contentType.value.toLocaleLowerCase()}/${id}/`);
    })
    .catch((error) => {
      nullProject.value = true;
      console.error(error);
    });
};

const addNewItemToken = computed(() => {
  return "sidebar_menu_project." + contentType.value.toLowerCase() + "_add";
});

// const decreasePageNumber = async () => {
//   if (pagination.value.get(contentType.value)?.currentPage === 1) return;

//   if (contentType.value === "Created") {
//     await getMyProjects(--pagination.value.get(contentType.value).currentPage);
//   } else if (contentType.value === "Joined") {
//     await getJoinedProjects(--pagination.value.get(contentType.value).currentPage);
//   }
// };
// const increasePageNumber = async () => {
//   if (
//     pagination.value.get(contentType.value)?.currentPage ===
//     pagination.value.get(contentType.value)?.totalPages
//   )
//     return;
//   if (contentType.value === "Created") {
//     await getMyProjects(++pagination.value.get(contentType.value).currentPage);
//   } else if (contentType.value === "Joined") {
//     await getJoinedProjects(++pagination.value.get(contentType.value).currentPage);
//   }
// };

watch(contentType, () => {
  selectNewProject();
  localStorage.sidebar = "normal";

  // remove class
  sidebarMenu?.value?.classList.remove("collapsed");
  sidebarMenu?.value?.classList.remove("first");
  sidebarMenu?.value?.classList.remove("second");
  sidebarMenu?.value?.classList.remove("show");
});
watch(myProjects, () => {
  listedItems.value.set("Created", myProjects.value);
  // pagination.value.set("Created", myProjectsPagination.value);
});
watch(joinedProjects, () => {
  listedItems.value.set("Joined", joinedProjects.value);
  // pagination.value.set("Joined", joinedProjectsPagination.value);
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
