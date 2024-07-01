<template>
  <div
    :id="id"
    ref="canvasRef"
    class="offcanvas offcanvas-end offcanvas-size-xl"
    data-bs-backdrop="false"
    tabindex="-1"
    :aria-labelledby="`${id}Label`"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps({
  id: { type: String, required: true },
});

const canvasRef = ref(null);

defineExpose({ canvasRef });
</script>
