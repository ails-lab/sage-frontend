<template>
  <div class="null-resource">
    <img class="error" src="@images/ic-check-error.svg" />
    <p>
      We were not able to find the
      <strong>{{ camelcaseString(props.type) }}</strong>
      with ID <strong>{{ id }}</strong
      >.
    </p>
    <p>
      Please select another {{ camelcaseString(props.type) }}
      from the menu on the left.
    </p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  type: {
    type: String,
    required: true,
  },
});

const route = useRoute();
const id = ref<string>(
  route.path.split(`/${props.type}/`)[1].replace(/\/$/, "")
);
</script>

<style lang="scss" scoped>
.null-resource {
  display: flex;
  align-items: center;
  flex-direction: column;
  position: fixed;
  right: 0;
  top: 96px;
  width: calc(100vw - 380px);
  img.error {
    width: 64px;
    margin-bottom: 24px;
  }
  span {
    font-size: inherit;
  }
}
</style>
