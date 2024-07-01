<template>
  <div :id="id" ref="bodyRef" :class="['offcanvas-body', classname]">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps({
  classname: {
    type: String,
    default: undefined,
  },
  id: {
    type: String,
    default: undefined,
  },
});

const bodyRef = ref(null);

defineExpose({ bodyRef });
</script>
