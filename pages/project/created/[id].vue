<template>
  <div v-if="fetchState === 'error'">
    <NullResourceMessage :type="'project'" />
  </div>
  <div v-else class="wrap">
    <ul id="myTab" class="nav nav-tabs" role="tablist">
      <li class="nav-item" role="presentation">
        <button
          id="project-users-tab"
          class="nav-link active"
          data-bs-toggle="tab"
          data-bs-target="#project-users"
          type="button"
          role="tab"
          aria-controls="project-users"
          aria-selected="false"
        >
          {{ $t("project_page.project_users") }}
          <span class="counter">
            {{
              selectedProject.joinedUsers
                ? selectedProject.joinedUsers.length
                : 0
            }}
          </span>
        </button>
      </li>
    </ul>
    <div id="myTabContent" class="tab-content">
      <simplebar
        id="project-users"
        class="tab-pane fade show active data-simplebar"
        role="tabpanel"
        aria-labelledby="project-users-tab"
      >
        <div class="content">
          <div
            v-if="
              !selectedProject.joinedUsers ||
              selectedProject.joinedUsers.length === 0
            "
            class="empty-result"
          >
            <p>
              {{ $t("project_page.no_users") }}
              <br />
            </p>
          </div>
          <ul v-else class="assetlist users">
            <li
              v-for="user of selectedProject.joinedUsers"
              :key="user.id"
              class="entry"
            >
              <div class="row">
                <div class="col-1 thumbnail">
                  <img class="thumb" src="@images/ic-menu-user-blue.svg" />
                </div>
                <div class="col-5 name">{{ user.name }}</div>
                <div class="col-5 text-truncate">{{ user.email }}</div>
              </div>
            </li>
          </ul>
        </div>
      </simplebar>
    </div>
  </div>
</template>

<script setup lang="ts">
import simplebar from "simplebar-vue";
import "simplebar-vue/dist/simplebar.min.css";

const { fetchState, selectedProject } = storeToRefs(useSidebarDataStore());
</script>
<style scoped lang="scss">
.users::before {
  content: none !important;
}
.thumb {
  width: 20px !important;
}
.data-simplebar {
  overflow: auto;
  height: calc(100vh - 125px);
  width: 100%;
}
</style>
