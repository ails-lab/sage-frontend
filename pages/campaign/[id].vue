<template>
  <div v-if="fetchState === 'error'">
    <NullResourceMessage :type="'campaign'" />
  </div>
  <div v-else class="wrap">
    <ul id="myTab" class="nav nav-tabs" role="tablist">
      <li class="nav-item" role="presentation">
        <button
          id="campaign-datasets-tab"
          class="nav-link active"
          data-bs-toggle="tab"
          data-bs-target="#campaign-datasets"
          type="button"
          role="tab"
          aria-controls="campaign-datasets"
          aria-selected="true"
        >
          {{ $t("campaign_page.datasets") }}
          <span class="counter">
            {{
              selectedCampaign.datasets ? selectedCampaign.datasets.length : 0
            }}
          </span>
        </button>
      </li>
      <li
        v-if="currentUser.role !== 'VALIDATOR'"
        class="nav-item"
        role="presentation"
      >
        <button
          id="campaign-users-tab"
          class="nav-link nospace"
          data-bs-toggle="tab"
          data-bs-target="#campaign-users"
          type="button"
          role="tab"
          aria-controls="campaign-users"
          aria-selected="false"
        >
          {{ $t("campaign_page.campaign_users") }}
          <span class="counter">
            {{
              selectedCampaign.validators
                ? selectedCampaign.validators.length
                : 0
            }}
          </span>
        </button>
      </li>
      <li v-if="currentUser.role !== 'VALIDATOR'" class="nav-action">
        <ul>
          <li>
            <a
              href="#offcanvasAddDatasets"
              data-bs-toggle="offcanvas"
              role="button"
              aria-controls="offcanvasAddDatasets"
            >
              <i class="fa-solid fa-plus"></i>
              {{ $t("campaign_page.add_datasets") }}
            </a>
          </li>
          <li>
            <a
              href="#offcanvasAddUser"
              data-bs-toggle="offcanvas"
              role="button"
              aria-controls="offcanvasAddUser"
            >
              <i class="fa-solid fa-plus"></i>
              {{ $t("campaign_page.add_users") }}
            </a>
          </li>
        </ul>
      </li>
    </ul>
    <div id="myTabContent" class="tab-content">
      <simplebar
        id="campaign-datasets"
        class="tab-pane fade show active data-simplebar"
        role="tabpanel"
        aria-labelledby="campaign-datasets-tab"
      >
        <div class="content">
          <ul
            v-if="!fetchingNewCampaign && campaignDatasets.length"
            class="assetlist dataset"
          >
            <li
              v-for="(dataset, index) of selectedCampaign?.datasets"
              :key="dataset.id"
            >
              <CampaignDatasetBlock
                :dataset="dataset"
                :index="index"
                @validation-clicked="validationClicked"
              />
            </li>
          </ul>
          <div v-else class="empty-result">
            <p>
              {{ $t("campaign_page.no_datasets") }}
              <br />
              <a
                href="#offcanvasAddDatasets"
                data-bs-toggle="offcanvas"
                role="button"
                aria-controls="offcanvasAddDatasets"
              >
                {{ $t("campaign_page.add_datasets_now") }}
              </a>
            </p>
          </div>
        </div>
      </simplebar>
      <div
        id="campaign-users"
        class="tab-pane fade"
        role="tabpanel"
        aria-labelledby="campaign-users-tab"
      >
        <div class="content">
          <div
            v-if="
              !selectedCampaign.validators ||
              selectedCampaign.validators.length === 0
            "
            class="empty-result"
          >
            <p>
              {{ $t("campaign_page.no_users") }}
              <br />
              <a
                href="#offcanvasAddUser"
                data-bs-toggle="offcanvas"
                role="button"
                aria-controls="offcanvasAddUser"
              >
                {{ $t("campaign_page.add_users_now") }}
              </a>
            </p>
          </div>
          <ul v-else class="assetlist users">
            <li
              v-for="user of selectedCampaign.validators"
              :key="user.id"
              class="entry"
            >
              <div class="row">
                <div class="col-1 thumbnail">
                  <img class="thumb" src="@images/ic-menu-user-blue.svg" />
                </div>
                <div class="col-5 name">{{ user.name }}</div>
                <div class="col-5 text-truncate">{{ user.email }}</div>
                <div class="col-1">
                  <div class="actionbar">
                    <ul>
                      <li class="delete">
                        <a
                          href="#"
                          data-toggle="tooltip"
                          title="Remove user"
                          data-boundary="window"
                          @click="removeUser(user.id)"
                          ><i class="remove fa-solid fa-xmark"></i
                        ></a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <AddDatasetsSidebar
    v-if="!fetchingNewCampaign && campaignFetched"
    target="campaign"
  />
  <AddUsersToCampaignSidebar
    v-if="
      currentUser.role !== 'VALIDATOR' &&
      !fetchingNewCampaign &&
      campaignFetched
    "
  />
  <ValidationSidebar
    v-if="!fetchingNewCampaign && campaignFetched"
    :dataset="datasetToValidate"
    @clear-pav="clearPav"
  />
</template>

<script setup lang="ts">
import simplebar from "simplebar-vue";
import "simplebar-vue/dist/simplebar.min.css";

const { t } = useI18n();
const { toaster } = useToaster();
const route = useRoute();
const { currentUser } = storeToRefs(useAuthStore());
const { $removeUserFromCampaign } = useNuxtApp();
const { fetchState, selectedCampaign } = storeToRefs(useSidebarDataStore());
const { selectNewCampaign } = useSidebarDataStore();
const datasetToValidate = ref<{}>({});

onMounted(async () => {
  await nextTick();
});

const clearPav = () => {
  datasetToValidate.value = {};
};

const campaignFetched = computed(() => !!selectedCampaign.value?.id);
const campaignDatasets = computed(() => selectedCampaign.value?.datasets ?? []);

const fetchingNewCampaign = computed(() => {
  const currentCampaignId = route.path.split("/")[2];
  return currentCampaignId !== selectedCampaign.value.id;
});

const removeUser = async (userId: string) => {
  const { error }: any = await $removeUserFromCampaign(
    selectedCampaign.value.id,
    userId
  );
  if (error.value) {
    toaster.error(t("add_users_sidebar.error_toast"));
  } else {
    toaster.success(t("add_users_sidebar.success_remove_toast"));
    await selectNewCampaign(selectedCampaign.value.id);
  }
};

const validationClicked = (dataset: {}) => {
  datasetToValidate.value = dataset;
};
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
