<template>
  <div class="field row">
    <label class="form-label col">
      <div class="lbl">{{ label }}</div>
      <div class="desc">
        {{ description }}
      </div>
    </label>
    <div class="form-field col">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label?: string;
  description?: string;
}>();
</script>

<styled lang="css"></styled>
