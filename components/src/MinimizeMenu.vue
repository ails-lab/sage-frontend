<template>
  <div class="minimize-menu right">
    <!-- minimize sidebar-->
    <NuxtLink
      class="first-stage"
      title="Minimize Sidebar"
      @click="firstStageClicked($event, props.sidebarMenu)"
    >
      <img class="button-mini" src="@images/ic-menu-chevron.svg" />
    </NuxtLink>
    <NuxtLink class="expand-stage" title="Open Sidebar">
      <img class="button-menu" src="@images/ic-menu-hamburger.svg" />
    </NuxtLink>
    <!-- expand sidebar-->
    <NuxtLink
      class="normal-stage"
      title="Expand Sidebar"
      @click="normalStageClicked($event, props.sidebarMenu)"
    >
      <img class="button-expand" src="@images/ic-menu-chevron-right.svg" />
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { useSidebarDataStore } from "@/stores/sidebarData";

const props = defineProps({
  sidebarMenu: {
    type: Object,
    required: true,
  },
});
const { selectedDataset, selectedCampaign, selectedScheme } = storeToRefs(
  useSidebarDataStore()
);

const resetMenu = () => {
  localStorage.sidebar = "normal";
  props.sidebarMenu?.classList.remove("collapsed");
  props.sidebarMenu?.classList.remove("first");
  props.sidebarMenu?.classList.remove("second");
  props.sidebarMenu?.classList.remove("show");
};

watch(selectedDataset, (newSelectedDataset, oldSelectedDataset) => {
  // If we didn't actually switch datasets, don't reset the menu-sidebars' view
  if (oldSelectedDataset.id !== newSelectedDataset.id) resetMenu();
});
watch(selectedCampaign, (newSelectedCampaign, oldSelectedCampaign) => {
  if (oldSelectedCampaign.id !== newSelectedCampaign.id) resetMenu();
});
watch(selectedScheme, (newSelectedScheme, oldSelectedScheme) => {
  if (oldSelectedScheme.id !== newSelectedScheme.id) resetMenu();
});
</script>

<style scoped></style>
