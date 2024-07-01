<template>
  <SchemeListing v-if="selectedScheme?.id" scheme-type="shacl" />
</template>

<script setup lang="ts">
const { selectedScheme } = storeToRefs(useSidebarDataStore());
</script>
