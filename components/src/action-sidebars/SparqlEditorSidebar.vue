<template>
  <ActionSidebar id="offcanvasSparqlEditor">
    <ActionSidebarHeader :title="t('dataset_page.query_with_sparql')">
    </ActionSidebarHeader>
    <ActionSidebarBody>
      <div class="activity">
        <div id="yasgui" />
      </div>
    </ActionSidebarBody>
  </ActionSidebar>
</template>

<script setup lang="ts">
import YasGui from "@triply/yasgui";
import "@triply/yasgui/build/yasgui.min.css";

const { t } = useI18n();
const { selectedDataset } = storeToRefs(useSidebarDataStore());

localStorage.removeItem("yagui__config");

const sparqlEndpoint = computed(() => {
  const baseUrl = `${useRuntimeConfig().public.baseUrl}`;
  return baseUrl + "/content/" + selectedDataset.value.uuid + "/sparql";
});

const settings = {
  requestConfig: { endpoint: sparqlEndpoint.value },
  copyEndpointOnNewTab: false,
};

onMounted(() => {
  const yasguiElement = document.getElementById("yasgui");
  if (yasguiElement) {
    new YasGui(yasguiElement, settings);
  }
});
</script>

<style scoped lang="scss"></style>
