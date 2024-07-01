<template>
  <ActionSidebar id="offcanvasJoinCampaign">
    <ActionSidebarHeader
      :title="$t('join_campaign_sidebar.join_campaign')"
      :description="$t('join_campaign_sidebar.join_campaign_description')"
    />
    <ActionSidebarBody id="campaign-list">
      <div class="activity">
        <div class="filter-section">
          <span class="stat space">
            <strong>{{ pagination.totalElements }} </strong>
            {{ $t("join_campaign_sidebar.campaigns") }}
          </span>
        </div>
        <div class="list-heading">
          <div class="row">
            <div class="col-2"></div>
            <div class="col-10">
              {{ $t("join_campaign_sidebar.campaign_name") }}
            </div>
          </div>
        </div>
        <!-- listing-->
        <div class="list-asset">
          <!-- entry -->
          <div
            v-for="actCampaign of activeCampaigns"
            :key="actCampaign.id"
            class="row entry"
          >
            <!-- fol-->
            <AddIconButton
              :class-name="'col-2'"
              :is-added="selected.includes(actCampaign.id)"
              :is-removable="false"
              @toggle="joinCampaign(actCampaign.id)"
            />
            <div class="col-10">
              <a href="#">{{ actCampaign.name }}</a>
            </div>
          </div>
        </div>
        <!-- pagination-->
        <div v-if="pagination?.totalPages > 1" class="pagination row">
          <li
            class="col-2"
            :class="{
              'v-hidden': pagination?.currentPage <= 1,
            }"
          >
            <NuxtLink @click.prevent="decreasePage">
              <i class="fa-solid fa-angle-left"></i
            ></NuxtLink>
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
import type { Campaign } from "@/types/Campaign";
import type { Pagination } from "@/types/Pagination";
import { useSidebarDataStore } from "~/stores/sidebarData";

const { toaster } = useToaster();

const { fetchJoinedCampaigns } = useSidebarDataStore();
const { $getActiveCampaigns, $joinCampaign } = useNuxtApp();
const { campaigns } = storeToRefs(useSidebarDataStore());
const activeCampaigns = ref<Campaign[]>([]);
const pagination = ref<Pagination>({} as Pagination);
const selected = ref<string[]>([]);

onMounted(async () => {
  if (!campaigns.value.length) {
    await fetchJoinedCampaigns(1);
  }
  await getActiveCampaigns(1);
});

const getActiveCampaigns = async (page: number) => {
  const { data, error } = await $getActiveCampaigns(page);
  if (error.value) {
    console.error(error.value);
  }
  activeCampaigns.value = data.value.data;
  pagination.value = data.value.pagination;
  selected.value = activeCampaigns.value
    .filter((c) => campaigns.value.some(({ id }) => c.id === id))
    .map((c) => c.id);
};

const joinCampaign = async (id: string) => {
  if (selected.value.includes(id)) {
    toaster.error("You are already a member of the campaign");
    return;
  }
  const { error } = await $joinCampaign(id);
  if (error.value) {
    toaster.error("You are already a member of the campaign");
    return;
  }
  selected.value.push(id);
  toaster.success("You have joined the campaign!");
  await fetchJoinedCampaigns(1);
};

const increasePage = () => {
  if (pagination.value.totalPages === pagination.value.currentPage) return;
  document.getElementById("campaign-list").scrollTop = 0;
  getActiveCampaigns(++pagination.value.currentPage);
};
const decreasePage = () => {
  if (pagination.value.currentPage === 1) return;
  document.getElementById("campaign-list").scrollTop = 0;
  getActiveCampaigns(--pagination.value.currentPage);
};
</script>

<style lang="scss" scoped>
#offcanvasJoinCampaign {
  width: 25% !important;
  min-width: 350px;
}
.added {
  a:hover {
    background-color: #6ea543 !important;
    border-color: #6ea543 !important;
  }
  .check {
    display: inline-block !important;
  }
}
</style>
