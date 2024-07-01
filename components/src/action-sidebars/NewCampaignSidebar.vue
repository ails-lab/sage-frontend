<template>
  <ActionSidebar id="offcanvasNewCampaign" ref="campaignCanvas">
    <ActionSidebarHeader
      :title="
        editCampaignClicked
          ? $t('new_campaign_sidebar.edit_campaign')
          : $t('new_campaign_sidebar.new_campaign')
      "
      :description="$t('new_campaign_sidebar.campaign_description')"
      :close-label="$t('cancel')"
      @close="editCampaignClicked = false"
    >
      <template #action>
        <ActionSidebarHeaderAction
          :aria-label="$t('save')"
          @click="saveCampaign"
        >
          {{ $t("save") }}
        </ActionSidebarHeaderAction>
      </template>
    </ActionSidebarHeader>
    <ActionSidebarBody>
      <div class="sage-form">
        <!-- <div class="sage-form-template">
            <div class="template-load">
              {{ $t("template.load_template") }}
              <div class="wrap">
                <select class="form-select" aria-label="formTemplate">
                  <option selected>{{ $t("please_select") }}</option>
                  <option value="Template 1">Template 1</option>
                  <option value="Template 2">Template 2</option></select
                ><i class="fa-solid fa-angle-down"></i>
              </div>
            </div>
            <div class="template-save">
              <a href="#">
                <i class="fa-regular fa-floppy-disk"></i>
                {{ $t("template.save_template") }}
              </a>
            </div>
          </div>-->
        <!-- field-->
        <div class="field row">
          <!-- column-->
          <label class="form-label col" for="mappingType">
            <!-- main labek-->
            <div class="lbl">{{ $t("new_campaign_sidebar.name") }} *</div>
            <div class="desc">
              {{ $t("new_campaign_sidebar.name_description") }}
            </div>
          </label>
          <!-- input-->
          <div class="form-field col">
            <!-- form control-->
            <input
              v-model="name"
              class="form-control"
              type="text"
              aria-label="mappingName"
            />
          </div>
        </div>
        <!-- field-->
        <div class="field row">
          <!-- column-->
          <label class="form-label col" for="mappingSample">
            <!-- main labek-->
            <div class="lbl">{{ $t("new_campaign_sidebar.state") }} *</div>
            <div class="desc">
              {{ $t("new_campaign_sidebar.state_description") }}
            </div>
          </label>
          <!-- input-->
          <div class="form-field col">
            <!-- form control-->
            <select
              v-model="state"
              class="form-select"
              aria-label="mappingSample"
            >
              <option selected value="">{{ $t("please_select") }}</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </div>
      <!-- form info-->
      <div class="sage-form-info">
        <div class="notify">{{ $t("mandatory_field_explanation") }}</div>
      </div>
    </ActionSidebarBody>
  </ActionSidebar>
</template>

<script setup lang="ts">
import { useSidebarDataStore } from "~/stores/sidebarData";

const { toaster } = useToaster();

const { fetchMyCampaigns, selectNewCampaign } = useSidebarDataStore();
const { editCampaignClicked, selectedCampaign } = storeToRefs(
  useSidebarDataStore()
);
const { $createCampaign, $editCampaign } = useNuxtApp();
const state = ref<string>("");
const name = ref<string>("");
const campaignCanvas = ref();

watch(editCampaignClicked, () => {
  if (editCampaignClicked.value) {
    name.value = selectedCampaign.value.name;
    state.value = selectedCampaign.value.state;
  } else {
    name.value = "";
    state.value = "";
  }
});

const saveCampaign = async () => {
  if (state.value === "" || name.value === "") {
    toaster.error(
      "Fill all the required fields. They are indicated by * next to the field name."
    );
    return;
  }
  if (!editCampaignClicked.value) {
    await createCampaign();
  } else {
    await updateCampaign();
  }
};

const createCampaign = async () => {
  const { error }: any = await $createCampaign(name.value, state.value);
  await fetchMyCampaigns(1);
  if (error.value) {
    toaster.error(error.value.data.message);
    return;
  }

  name.value = "";
  state.value = "";

  hideOffcanvas(campaignCanvas);
  editCampaignClicked.value = false;

  toaster.success("Campaign created successfully.");
};

const updateCampaign = async () => {
  const { error }: any = await $editCampaign(
    selectedCampaign.value.id,
    name.value,
    state.value
  );
  await fetchMyCampaigns(1);
  if (error.value) {
    toaster.error(error.value.data.message);
    return;
  }

  name.value = "";
  state.value = "";

  await selectNewCampaign(selectedCampaign.value.id);
  hideOffcanvas(campaignCanvas);
  editCampaignClicked.value = false;

  toaster.success("Campaign updated successfully.");
};
</script>
