<template>
  <div
    id="alert-modal"
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
          <p v-if="props.timestamp" class="report">
            {{ props.report }} {{ eventMinutesAgo }}
          </p>
          <p class="message">
            {{ props.message }}
          </p>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-primary"
            data-bs-dismiss="modal"
            @click="understood()"
          >
            {{ $t("understood") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(["okay"]);

const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  report: {
    type: String,
    required: true,
  },
  timestamp: {
    type: String,
    required: true,
  },
});

const eventMinutesAgo = ref<string>("");
let intervalId: NodeJS.Timeout | null = null;

const calculateMinutesAgo = () => {
  if (!props.timestamp) return;
  const minutes = Math.floor(
    (new Date() - new Date(props.timestamp)) / (1000 * 60)
  );
  const label = minutes !== 1 ? "minutes ago" : "minute ago";
  eventMinutesAgo.value = `${minutes} ${label}`;
};

const understood = () => {
  emit("okay");
};

onUpdated(() => {
  calculateMinutesAgo();
  intervalId = setInterval(calculateMinutesAgo, 60000);
});

onUnmounted(() => {
  clearInterval(intervalId);
});
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
  justify-content: center;
  .btn {
    background-color: #b2464c;
    border-color: #b2464c;
  }
}
</style>
