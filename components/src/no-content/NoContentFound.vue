<template>
  <div class="empty-result">
    <p>
      {{ text }}
      <br />
      <a
        v-if="shouldRenderAction"
        :href="actionHRef"
        data-bs-toggle="offcanvas"
        role="button"
        :aria-controls="ariaControls"
        @click="handleClick"
      >
        {{ actionText }}
      </a>
    </p>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(["click"]);
const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  actionText: {
    type: String,
    default: null,
  },
  actionHRef: {
    type: String,
    default: null,
  },
});

const ariaControls = computed(() => props.actionHRef?.slice(1));

const handleClick = () => {
  emit("click");
};

const shouldRenderAction = computed(
  () => typeof props.actionText === "string" && props.actionText.length
);
</script>

<style scoped lang="scss">
@import "~/assets/styles/variables.scss";

.empty-result {
  width: 60%;
  text-align: center;
  margin: 0 auto;
  padding-top: 15px;
  line-height: 24px;
  color: $text-second-color;

  a {
    color: inherit;
    text-decoration: underline !important;

    &:hover {
      color: #333;
    }
  }
}
</style>
