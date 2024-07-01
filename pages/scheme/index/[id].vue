<template>
  <SchemeListing v-if="selectedScheme?.id" scheme-type="index" />
</template>

<script setup lang="ts">
const { selectedScheme } = storeToRefs(useSidebarDataStore());
</script>
