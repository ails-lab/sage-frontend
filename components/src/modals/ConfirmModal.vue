<template>
  <div
    id="confirm-modal"
    class="modal fade"
    data-bs-backdrop="static"
    data-bs-keyboard="false"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header justify-content-start">
          <img class="error" src="@images/ic-check-error.svg" />
          <span class="modal-title ms-2">{{ $t("warning") }}</span>
        </div>
        <div class="modal-body">
          <p class="message">
            {{ message }}
          </p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-light" data-bs-dismiss="modal">
            {{ $t("cancel") }}
          </button>
          <button
            type="button"
            class="btn btn-danger"
            data-bs-dismiss="modal"
            @click="onConfirm"
          >
            {{ $t("confirm") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useModalsStore } from "@/stores/modals";

const { confirmModal } = storeToRefs(useModalsStore());
const onConfirm = computed(() => confirmModal.value.onConfirm);
const message = computed(() => confirmModal.value.message);
</script>

<style lang="scss" scoped>
.modal-header {
  border-bottom: none;
  .modal-title {
    font-size: 20px;
  }
}
.modal-body {
  .report {
    font-style: italic;
    font-weight: 500;
    text-align: center;
  }
  .message {
    line-height: 1.2rem;
  }
}
.modal-footer {
  border-top: none;
  justify-content: end;
  .btn-danger {
    background-color: #b2464c;
    border-color: #b2464c;
  }
}
</style>
