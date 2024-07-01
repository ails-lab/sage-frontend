<template>
  <SchemeListing v-if="selectedScheme?.id" scheme-type="annotator" />
</template>

<script setup lang="ts">
const { selectedScheme } = storeToRefs(useSidebarDataStore());
</script>
