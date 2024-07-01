<template>
  <div class="filter-section validation">
    <div class="filter-section-title">
      <h5>{{ props.datasetName }}</h5>
      <p class="desc">{{ props.propertyName }}</p>
    </div>
    <div class="filter-section-metadata right">
      <ul>
        <li class="timer">
          <div class="lbl">{{ $t("validation_sidebar.remaining_time") }}</div>
          <div class="value">
            <vue-countdown
              v-slot="{ minutes, seconds }"
              :transform="transformSlotProps"
              :time="props.time"
              @end="emit('timerFinish')"
            >
              {{ minutes }}:{{ seconds }}
            </vue-countdown>
          </div>
        </li>
        <li>
          <div class="lbl">{{ $t("validation_sidebar.validation") }}</div>
          <div class="value">
            {{ props.progress.totalValidations }}
          </div>
        </li>
        <li>
          <div class="lbl">{{ $t("validation_sidebar.annotation") }}</div>
          <div class="value">
            {{ props.progress.totalAnnotations }}
          </div>
        </li>
        <li>
          <div class="lbl">{{ $t("validation_sidebar.addition") }}</div>
          <div class="value">{{ props.progress.totalAdded }}</div>
        </li>
      </ul>
    </div>
  </div>
  <div class="filter-progress sticky-top">
    <div class="progress">
      <div
        class="progress-bar"
        role="progressbar"
        aria-label="Segment one"
        aria-valuenow="40"
        aria-valuemin="0"
        aria-valuemax="100"
        :style="`width: ${
          (props.progress.totalValidations / props.progress.totalAnnotations) *
          100
        }%`"
      >
        <div class="progress-value">
          {{
            (
              (props.progress.totalValidations /
                props.progress.totalAnnotations) *
              100
            ).toFixed(2)
          }}%
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import VueCountdown from "@chenfengyuan/vue-countdown";

const props = defineProps({
  datasetName: {
    type: String,
    required: true,
  },
  propertyName: {
    type: String,
    default: "-",
  },
  progress: {
    type: Object,
    required: true,
  },
  time: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["timerFinish"]);

const transformSlotProps = (props: any) => {
  const formattedProps: any = {};

  Object.entries(props).forEach(([key, value]) => {
    formattedProps[key] = (value as number) < 10 ? `0${value}` : String(value);
  });

  return formattedProps;
};
</script>

<style scoped></style>
