<template>
  <div :class="['offcanvas-header', className]">
    <div class="offcanvas-headerinfo">
      <h4 id="offcanvasExampleLabel" class="offcanvas-title">
        {{ title }}
      </h4>
      <p v-if="description" class="offcanvas-description">
        {{ description }}
      </p>
      <slot name="description" />
    </div>
    <ul class="offcanvas-action">
      <li>
        <a
          href="#"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
          @click="handleClose"
        >
          {{ closeLabel || $t("close") }}
        </a>
      </li>
      <slot name="action" />
    </ul>
  </div>
</template>

<script setup lang="ts">
defineProps({
  className: {
    type: String,
    default: undefined,
  },
  title: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  closeLabel: {
    type: String,
    default: undefined,
  },
});

const emit = defineEmits(["close"]);

const handleClose = (e: MouseEvent) => {
  emit("close", e);
};
</script>
<style scoped lang="scss">
.offcanvas-action {
  li::before {
    content: none !important;
  }
  li::after {
    content: none !important;
  }
}
</style>
