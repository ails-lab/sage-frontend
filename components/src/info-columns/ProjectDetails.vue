<template>
  <div class="col nav-third">
    <div class="content">
      <div class="wrap">
        <div class="info-detail">
          <h2>{{ selectedProject.name }}</h2>
          <span class="type upper">{{ $t("project_details.project") }} </span>
        </div>
        <div v-if="currentUser.role === 'EDITOR'" class="actionbar">
          <ul>
            <li>
              <a
                ref="editIcon"
                class="sage-icon"
                href="#offcanvasNewProject"
                data-bs-toggle="offcanvas"
                role="button"
                aria-controls="offcanvasNewProject"
                data-toggle="tooltip"
                title="Edit Project"
                data-boundary="window"
                @click="editClicked"
              >
                <i class="edit"> </i>
              </a>
            </li>
          </ul>
        </div>
        <simplebar class="asset-list data-simplebar">
          <div class="info-meta">
            <div class="field">
              <div class="title">UUID</div>
              <div class="value">{{ selectedProject.uuid }}</div>
            </div>
          </div>
          <div class="info-meta">
            <div v-if="selectedProject.identifier" class="field">
              <div class="title">{{ $t("project_details.identifier") }}</div>
              <div class="value">{{ selectedProject.identifier }}</div>
            </div>
            <div class="field">
              <div class="title upper">
                {{ $t("project_details.visibility") }}
              </div>
              <div class="value capitalized-value">
                {{ selectedProject.public ? "Public" : "Private" }}
              </div>
            </div>
            <div v-if="selectedProject.createdAt" class="field">
              <div class="title">{{ $t("project_details.createdAt") }}</div>
              <div class="value capitalized-value">
                {{ dateStamp(selectedProject.createdAt) }}
              </div>
            </div>
            <div v-if="selectedProject.updatedAt" class="field">
              <div class="title">{{ $t("project_details.updatedAt") }}</div>
              <div class="value capitalized-value">
                {{ dateStamp(selectedProject.updatedAt) }}
              </div>
            </div>
          </div>
        </simplebar>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import simplebar from "simplebar-vue";
import "simplebar-vue/dist/simplebar.min.css";

const { $bootstrap } = useNuxtApp();
const { currentUser } = storeToRefs(useAuthStore());
const { selectedProject, editProjectClicked } = storeToRefs(
  useSidebarDataStore()
);

const editIcon = ref(null);

onMounted(() => {
  // Attach tooltips
  if (currentUser.value.role === "EDITOR") {
    new $bootstrap.Tooltip(editIcon.value!, { trigger: "hover" });
  }
});

const editClicked = () => {
  const offCanvasProject = document.getElementById("offcanvasNewProject");
  if (offCanvasProject?.classList.contains("show")) {
    editProjectClicked.value = false;
  } else {
    editProjectClicked.value = true;
  }
};
</script>

<style scoped>
.asset-list {
  overflow: auto;
  height: calc(100vh - 235px);
  width: 100%;
}
.capitalized-value {
  text-transform: capitalize;
}
</style>
