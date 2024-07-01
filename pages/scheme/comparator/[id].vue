<template>
  <SchemeListing v-if="selectedScheme?.id" scheme-type="comparator" />
</template>

<script setup lang="ts">
const { selectedScheme } = storeToRefs(useSidebarDataStore());
</script>
