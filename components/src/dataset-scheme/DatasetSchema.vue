<template>
  <div class="data-scheme">
    <ClassPartition
      v-for="(cp, index) in selectedDatasetSchema.classPartition"
      :key="'class-partition-' + index"
      :class-partition="cp"
      :index="index"
      @add-annotator="$emit('addAnnotator', $event)"
      @browse-items="selectUri($event)"
      @view-values="selectPropertyUri($event)"
    />
  </div>

  <BrowseItemsSidebar :selected-uri="selectedUri" @close="selectUri('')" />
  <ViewValuesSidebar
    :class-uri="classUri"
    :property-uri="propertyUri"
    @close="emptySelectedUris()"
  />
  <ContributorPagedValidationSidebar />
  <NewFilterValidationSidebar />
  <ExportAnnotationValidationsSidebar />
  <ExportAnnotationsSidebar />
</template>

<script setup lang="ts">
defineEmits(["addAnnotator"]);
const { selectedDatasetSchema } = storeToRefs(useSidebarDataStore());

const selectedUri = ref("");
const classUri = ref("");
const propertyUri = ref("");

const selectUri = (uri: string) => {
  selectedUri.value = uri;
};
const emptySelectedUris = () => {
  classUri.value = "";
  propertyUri.value = "";
};
const selectPropertyUri = (data: { propertyUri: string; classUri: string }) => {
  classUri.value = data.classUri;
  propertyUri.value = data.propertyUri;
};
</script>

<style scoped lang="scss">
.data-scheme {
  margin-top: 20px;
}
</style>
