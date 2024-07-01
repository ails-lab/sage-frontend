<template>
  <ActionSidebar id="offcanvasAddUser">
    <ActionSidebarHeader
      :title="$t('add_users_sidebar.title')"
      :description="$t('add_users_sidebar.description')"
      @close="selectNewCampaign(selectedCampaign.id)"
    />
    <ActionSidebarBody id="user-list">
      <div class="activity">
        <div class="filter-section">
          <span class="stat space">
            <strong>{{ noOfUsersSelected }}</strong>
            {{ $t("add_users_sidebar.users_selected") }}
          </span>
          <!-- <div class="search">
            <i class="ic-search fa-solid fa-magnifying-glass"></i>
            <input class="form-control" type="text" />
            <a
              class="sage-icon filter"
              href="#"
              data-toggle="tooltip"
              title="Filter"
              data-boundary="window"
            >
              <i class="filter blue"></i>
            </a>
          </div>-->
        </div>
        <div class="list-heading">
          <div class="row">
            <div class="col-1"></div>
            <div class="col-3 name">{{ $t("add_users_sidebar.name") }}</div>
            <div class="col-4">{{ $t("add_users_sidebar.email") }}</div>
            <div class="col-4 role">{{ $t("add_users_sidebar.role") }}</div>
          </div>
        </div>
        <div class="list-asset">
          <div v-for="user of users" :key="user.id" class="row entry">
            <AddIconButton
              :is-added="isUserSelected(user)"
              @toggle="toggleSelected(user)"
            />
            <div class="col-3 name">{{ user.name }}</div>
            <div class="col-4">{{ user.email }}</div>
            <div class="col-4 role">
              <ul class="roles">
                <li
                  v-for="role of user.roles"
                  :key="role"
                  :class="{ purple: role === 'VALIDATOR' }"
                >
                  {{ role }}
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div v-if="pagination?.totalPages > 1" class="pagination row">
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
          <li class="col-2">
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
import type { Pagination } from "@/types/Pagination";
import type { User } from "@/types/User";

const { t } = useI18n();
const { toaster } = useToaster();

const { selectedCampaign } = storeToRefs(useSidebarDataStore());
const { selectNewCampaign } = useSidebarDataStore();
const { $getValidators, $addUserToCampaign, $removeUserFromCampaign } =
  useNuxtApp();

const users = ref<User[]>([]);
const pagination = ref<Pagination>({} as Pagination);
const visitedPages = ref<number[]>([]);
const selected = ref<string[]>([]);
const noOfUsersSelected = ref<number>(0);

onMounted(async () => {
  await nextTick();
  await getValidators(1);
  noOfUsersSelected.value = selectedCampaign.value.validators?.length ?? 0;
});

const getValidators = async (page: number) => {
  const { data, error } = await $getValidators(page);
  if (error.value) {
    console.error(error.value);
    return [];
  }
  users.value = data.value.data;
  pagination.value = data.value.pagination;
  if (visitedPages.value.includes(page)) return;
  if (selectedCampaign.value.validators) {
    selected.value = selected.value.concat(
      selectedCampaign.value.validators
        .filter((d) => users.value.some(({ id }) => d.id === id))
        .map((d) => d.id)
    );
    visitedPages.value.push(page);
  }
};

const isUserSelected = (user: User): boolean => {
  return selected.value.includes(user.id);
};

const toggleSelected = async (user: User) => {
  if (!isUserSelected(user)) {
    const { error } = await $addUserToCampaign(
      selectedCampaign.value.id,
      user.id
    );
    if (error.value) {
      toaster.error(t("add_users_sidebar.error_toast"));
    } else {
      toaster.success(t("add_users_sidebar.success_add_toast"));
      selected.value.push(user.id);
      noOfUsersSelected.value++;
    }
  } else {
    const { error } = await $removeUserFromCampaign(
      selectedCampaign.value.id,
      user.id
    );
    if (error.value) {
      toaster.error(t("add_users_sidebar.error_toast"));
    } else {
      toaster.success(t("add_users_sidebar.success_remove_toast"));
      const index = selected.value.indexOf(user.id);
      if (index !== -1) {
        selected.value.splice(index, 1);
        noOfUsersSelected.value--;
      }
    }
  }
};

const increasePage = () => {
  if (pagination.value.totalPages === pagination.value.currentPage) return;
  document.getElementById("user-list").scrollTop = 0;
  getValidators(++pagination.value.currentPage);
};
const decreasePage = () => {
  if (pagination.value.currentPage === 1) return;
  document.getElementById("user-list").scrollTop = 0;
  getValidators(--pagination.value.currentPage);
};
</script>

<style scoped></style>
