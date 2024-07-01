<template>
  <div
    ref="sidebarMenu"
    class="sidebar-menu"
    data-minimize-sizebar="sidebar-menu"
    :class="{
      'validator-minimize-menu first collapsed':
        currentUser.role === 'VALIDATOR' && campaignIsSelected,
    }"
  >
    <!-- second-->
    <MinimizeMenu
      v-if="currentUser.role !== 'VALIDATOR' && campaignIsSelected"
      :sidebar-menu="sidebarMenu"
    />

    <!-- minimize button on the left side-->
    <div class="minimize-menu left">
      <NuxtLink
        class="second-stage"
        title="Minimize Sidebar Further"
        @click="secondStageClicked($event, sidebarMenu)"
      >
        <img class="button-mini" src="@images/ic-menu-chevron.svg" />
      </NuxtLink>
      <NuxtLink
        v-if="currentUser.role === 'VALIDATOR'"
        class="normal-stage"
        title="Expand Sidebar"
        @click="normalStageClicked($event, sidebarMenu)"
      >
        <img class="button-expand" src="@images/ic-menu-chevron-right.svg" />
      </NuxtLink>
    </div>
    <div class="col nav-second">
      <div class="content">
        <!-- wrap-->
        <div class="wrap">
          <!-- subsite-->
          <h1 class="subsite">SAGE {{ props.instanceName }}</h1>
          <!-- menu -->
          <ul class="navigation type">
            <li class="selected">
              <a href="#">
                {{ $t("sidebar_menu_campaign.campaign") }}
              </a>
            </li>
          </ul>
          <!-- deac-->
          <div class="desc">
            <p class="dataset">
              {{ $t("sidebar_menu_campaign.campaign_description") }}
            </p>
          </div>
          <!-- form-->
          <div class="form search">
            <!-- <i class="ic-search fa-solid fa-magnifying-glass"></i> -->
            <!-- <input type="text" /> -->
            <div class="counter">
              {{ campaignPagination.totalElements }}
              {{ $t("sidebar_menu_campaign.campaigns") }}
            </div>
            <!-- <ul class="formaction">
              <li>
                <a
                  class="sage-icon"
                  href="#"
                  data-toggle="tooltip"
                  title="Filter"
                  data-boundary="window"
                  ><i class="filter"></i
                ></a>
              </li>
            </ul> -->
          </div>
        </div>
        <!-- list -->
        <simplebar class="asset-list data-simplebar">
          <ul class="listing">
            <li
              v-for="campaign of campaigns"
              :key="campaign.id"
              :class="{ selected: campaign.id === selectedCampaign?.id }"
              @click="selectCampaign(campaign.id)"
            >
              <NuxtLink>
                <div class="title">{{ campaign.name }}</div>
                <div class="type">{{ campaign.state }}</div></NuxtLink
              >
            </li>
          </ul>
        </simplebar>
        <!-- pagination-->
        <div v-if="campaignPagination.totalPages > 1" class="pagination row">
          <li
            class="col-md-2"
            :class="{ 'v-hidden': campaignPagination?.currentPage <= 1 }"
          >
            <NuxtLink @click.prevent="decreasePageNumber">
              <i class="fa-solid fa-angle-left"></i>
            </NuxtLink>
          </li>
          <li class="col-8">
            <div class="info">
              {{ $t("pagination.page") }}
              {{ campaignPagination.currentPage || 1 }}
              {{ $t("pagination.of") }}
              {{ campaignPagination.totalPages }}
            </div>
          </li>
          <li
            class="col-md-2"
            :class="{
              'v-hidden':
                campaignPagination?.currentPage >=
                campaignPagination?.totalPages,
            }"
          >
            <NuxtLink @click.prevent="increasePageNumber">
              <i class="fa-solid fa-angle-right"></i>
            </NuxtLink>
          </li>
        </div>
        <!-- button new-->
        <div v-if="currentUser.role === 'EDITOR'" class="asset-new">
          <a
            href="#offcanvasNewCampaign"
            data-bs-toggle="offcanvas"
            role="button"
            aria-controls="offcanvasNewCampaign"
          >
            <i class="fa-solid fa-plus"></i>
            {{ $t("sidebar_menu_campaign.add_new_campaign") }}
          </a>
        </div>
        <div v-else-if="currentUser.role === 'VALIDATOR'" class="asset-new">
          <a
            href="#offcanvasJoinCampaign"
            data-bs-toggle="offcanvas"
            role="button"
            aria-controls="offcanvasJoinCampaign"
          >
            <i class="fa-solid fa-plus"></i>
            {{ $t("sidebar_menu_campaign.join_campaign") }}
          </a>
        </div>
        <!-- not selected-->
        <div v-if="!campaignIsSelected" class="notselected">
          <p
            class="text"
            v-html="$t('sidebar_menu_campaign.campaign_not_selected')"
          ></p>
          <img src="@images/ic-line-arrow.svg" />
        </div>
      </div>
    </div>
    <CampaignDetails
      v-if="currentUser.role !== 'VALIDATOR' && campaignIsSelected"
    />
  </div>
  <JoinCampaignSidebar v-if="campaignsFetched" />
  <NewCampaignSidebar />
</template>

<script setup lang="ts">
import simplebar from "simplebar-vue";
import "simplebar-vue/dist/simplebar.min.css";
import { useSidebarDataStore } from "~/stores/sidebarData";
import { useAuthStore } from "~/stores/auth";

const { currentUser } = storeToRefs(useAuthStore());
const { fetchMyCampaigns, fetchJoinedCampaigns, selectNewCampaign } =
  useSidebarDataStore();

const { campaigns, campaignPagination, selectedCampaign } = storeToRefs(
  useSidebarDataStore()
);

const props = defineProps({
  instanceName: {
    type: String,
    required: true,
  },
});

const route = useRoute();
const nullCampaign = ref<boolean>(false);
const sidebarMenu = ref<HTMLElement | null>(null);
const campaignsFetched = ref<boolean>(false);

const campaignIsSelected = computed(() => {
  return (
    selectedCampaign.value &&
    Object.keys(selectedCampaign.value).length &&
    !nullCampaign.value
  );
});

onMounted(async () => {
  await nextTick();
  await getCampaigns(1);
  campaignsFetched.value = true;

  const campaignPattern = /^\/campaign\/[^/]+\/?$/;
  if (campaignPattern.test(route.path)) {
    await selectCampaign(route.path.split("/")[2]);
  }
});

const getCampaigns = async (pageNumber: number) => {
  if (currentUser.value.role === "EDITOR") {
    await fetchMyCampaigns(pageNumber);
  } else {
    await fetchJoinedCampaigns(pageNumber);
  }
};

const selectCampaign = (id: string) => {
  selectNewCampaign(id)
    .then(() => {
      nullCampaign.value = false;
      navigateTo(`/campaign/${selectedCampaign.value.id}/`);
    })
    .catch((error) => {
      nullCampaign.value = false;
      console.error(error);
    });
};

const increasePageNumber = async () => {
  if (
    campaignPagination.value.currentPage === campaignPagination.value.totalPages
  )
    return;
  await getCampaigns(++campaignPagination.value.currentPage);
};

const decreasePageNumber = async () => {
  if (campaignPagination.value.currentPage === 1) return;
  await getCampaigns(--campaignPagination.value.currentPage);
};
</script>

<style lang="scss">
a {
  cursor: pointer;
}
.form .counter {
  margin-bottom: 20px;
}
.validator-minimize-menu {
  .normal-stage {
    display: none;
  }
  &.second {
    .minimize-menu.left {
      left: 35px !important;
      display: block !important;
    }
    &.show {
      .minimize-menu.left {
        left: 277px !important;
        @media (max-width: 1399.98px) {
          left: 238px !important;
        }
      }
    }
    .second-stage {
      display: none;
    }
    .normal-stage {
      display: block;
    }
  }
}
</style>
