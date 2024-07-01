<template>
  <li :class="['main', className]">
    <a :href="href" :aria-label="ariaLabel" @click="emit('click')">
      <slot />
    </a>
  </li>
</template>

<script setup lang="ts">
const emit = defineEmits(["click"]);
defineProps({
  className: {
    type: String,
    default: undefined,
  },
  href: {
    type: String,
    default: undefined,
  },
  ariaLabel: {
    type: String,
    default: undefined,
  },
});
</script>
