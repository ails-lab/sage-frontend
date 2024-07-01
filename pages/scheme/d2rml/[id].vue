<template>
  <SchemeListing v-if="selectedScheme?.id" scheme-type="d2rml" />
</template>

<script setup lang="ts">
const { selectedScheme } = storeToRefs(useSidebarDataStore());
</script>
