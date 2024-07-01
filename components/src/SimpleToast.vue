<template>
  <div
    ref="toast"
    :class="state.class"
    class="toast"
    role="alert"
    aria-live="assertive"
    aria-atomic="true"
    data-bs-autohide="true"
  >
    <div class="toast-body">
      <div class="row">
        <div class="col ic">
          <img
            v-if="state.type === 'success'"
            class="success"
            src="@images/ic-check.svg"
          />
          <img v-else class="error" src="@images/ic-check-error.svg" />
        </div>
        <div class="col-8 content">{{ state.message }}</div>
        <div class="col close">
          <button
            class="btn-close"
            type="button"
            data-bs-dismiss="toast"
            aria-label="Close"
            @click="hideToast()"
          ></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { state, isShown, hideToast } = useToaster();

watch(
  () => isShown.value,
  (shown) => {
    if (shown) {
      setTimeout(() => {
        hideToast();
      }, 5000);
    }
  }
);
</script>

<style scoped>
.toast {
  /* to visible in offcanvas mode that haas z-index: 1045 */
  z-index: 1050;
  position: fixed;
  top: 40px;
  right: 40px;
  .toast-body .row .content {
    height: unset;
  }
}
</style>
