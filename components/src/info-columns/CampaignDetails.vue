<template>
  <div class="col nav-third">
    <div class="content">
      <!-- menu-->
      <!-- menu-->
      <!-- wrap-->
      <div class="wrap">
        <!-- information-->
        <div class="info-detail">
          <!-- selected title-->
          <h2>{{ selectedCampaign.name }}</h2>
          <span class="type upper">{{ $t("campaign_details.campaign") }} </span>
        </div>
        <!-- selected action-->
        <div v-if="currentUser.role === 'EDITOR'" class="actionbar">
          <ul>
            <li>
              <a
                ref="editIcon"
                class="sage-icon"
                href="#offcanvasNewCampaign"
                data-bs-toggle="offcanvas"
                role="button"
                aria-controls="offcanvasNewCampaign"
                data-toggle="tooltip"
                title="Edit Campaign"
                data-boundary="window"
                @click="editClicked"
              >
                <i class="edit"> </i>
              </a>
            </li>
            <li>
              <a
                ref="deleteIcon"
                class="sage-icon"
                data-toggle="tooltip"
                title="Delete Campaign"
                data-boundary="window"
                @click="showDeleteConfirmationModal"
              >
                <i class="delete"></i>
              </a>
            </li>
          </ul>
        </div>
        <simplebar class="asset-list data-simplebar">
          <!-- metadata-->
          <div class="info-meta">
            <!-- field-->
            <div class="field">
              <div class="title upper">{{ $t("campaign_details.state") }}</div>
              <div class="value capitalized-value">
                {{
                  selectedCampaign.state === "INACTIVE" ? "Inactive" : "Active"
                }}
              </div>
            </div>
          </div>
          <!-- metadata-->
          <div class="info-meta">
            <!-- field-->
            <div class="field">
              <div class="title upper">
                {{ $t("campaign_details.datasets") }}
              </div>
              <div class="value">
                {{
                  selectedCampaign.datasets
                    ? selectedCampaign?.datasets?.length
                    : 0
                }}
              </div>
            </div>
            <div class="field">
              <div class="title upper">{{ $t("campaign_details.users") }}</div>
              <div class="value">
                {{
                  selectedCampaign.validators
                    ? selectedCampaign?.validators?.length
                    : 0
                }}
              </div>
            </div>
          </div>
        </simplebar>

        <!-- menu-->
        <!-- menu-->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import simplebar from "simplebar-vue";
import "simplebar-vue/dist/simplebar.min.css";
import { useModalsStore } from "@/stores/modals";

const { $bootstrap } = useNuxtApp();
const { t } = useI18n();
const { showConfirmModal } = useModalsStore();
const { currentUser } = storeToRefs(useAuthStore());
const { selectedCampaign, editCampaignClicked } = storeToRefs(
  useSidebarDataStore()
);

const { fetchMyCampaigns, selectNewCampaign } = useSidebarDataStore();

const deleteIcon = ref(null);
const editIcon = ref(null);

onMounted(() => {
  // Attach tooltips
  if (currentUser.value.role === "EDITOR") {
    new $bootstrap.Tooltip(deleteIcon.value!, { trigger: "hover" });
    new $bootstrap.Tooltip(editIcon.value!, { trigger: "hover" });
  }
});

const editClicked = () => {
  const offCanvasCampaign = document.getElementById("offcanvasNewCampaign");
  if (offCanvasCampaign?.classList.contains("show")) {
    editCampaignClicked.value = false;
  } else {
    editCampaignClicked.value = true;
  }
};

const showDeleteConfirmationModal = () => {
  showConfirmModal(
    t("confirm_delete_this_item", { itemToDelete: "campaign" }),
    deleteCampaign
  );
};

const deleteCampaign = async () => {
  const { $deleteCampaign } = useNuxtApp();
  const { error } = await $deleteCampaign(selectedCampaign.value.id);
  if (error.value) {
    console.error(error.value.message);
    return;
  }
  selectNewCampaign();
  await navigateTo("/campaign");
  await fetchMyCampaigns(1);
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
