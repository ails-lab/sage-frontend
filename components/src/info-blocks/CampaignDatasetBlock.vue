<template>
  <div class="asset">
    <!-- header-->
    <div
      class="asset-header"
      :class="{ 'round-corners': datasetPagedValidations.length === 0 }"
    >
      <!-- row-->
      <div class="row">
        <!-- info-->
        <div
          class="asset-header-info col-9"
          :class="{ 'no-datasets': !datasetPagedValidations.length }"
        >
          <h5>{{ props.dataset.name }}</h5>
          <span v-if="datasetPagedValidations.length" class="type"
            >{{ getProgressAverage.toFixed(2) }}%</span
          >
        </div>
        <!-- actionbar-->
        <div class="actionbar col-3">
          <ul>
            <!-- <li>
              <a
                class="sage-icon"
                href="#"
                role="button"
                id="dropdown-menu-more-import"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                ><i class="more blue"></i
              ></a>
            </li> -->
          </ul>
        </div>
      </div>
    </div>
    <div v-if="datasetPagedValidations.length" class="asset-content">
      <div
        v-for="pav of datasetPagedValidations"
        :key="pav.id"
        class="asset-content-item"
      >
        <div class="row">
          <div class="col-5 break-word">{{ pav.propertyName }}</div>
          <div class="col-1">
            <span v-if="pav.asProperty" class="cat lbl">{{
              getProperty(pav.asProperty)
            }}</span>
          </div>
          <div class="col-5">
            <div class="row">
              <div class="col-10">
                <div class="progress-stacked">
                  <div
                    class="progress"
                    data-toggle="tooltip"
                    title="Approved"
                    data-boundary="window"
                    role="progressbar"
                    aria-label="Segment one"
                    :aria-valuenow="pav.progress.totalAccepted"
                    aria-valuemin="0"
                    :aria-valuemax="100"
                    :style="
                      getWidth(
                        pav.progress.totalAccepted,
                        pav.progress.totalAnnotations
                      )
                    "
                  >
                    <div class="progress-bar bg-success"></div>
                  </div>
                  <div
                    class="progress"
                    data-toggle="tooltip"
                    title="Rejected"
                    data-boundary="window"
                    role="progressbar"
                    aria-label="Segment one"
                    :aria-valuenow="pav.progress.totalRejected"
                    aria-valuemin="0"
                    :aria-valuemax="pav.progress.totalAnnotations"
                    :style="
                      getWidth(
                        pav.progress.totalRejected,
                        pav.progress.totalAnnotations
                      )
                    "
                  >
                    <div class="progress-bar bg-danger"></div>
                  </div>
                </div>
              </div>
              <div class="col-2 px-0">
                <div class="counter">
                  {{
                    (
                      (pav.progress.totalValidations /
                        pav.progress.totalAnnotations) *
                      100
                    ).toFixed(2)
                  }}%
                </div>
              </div>
            </div>
          </div>
          <div class="col-1">
            <div class="actionbar">
              <ul>
                <li>
                  <a
                    class="sage-icon"
                    href="#offcanvasValidation"
                    data-bs-toggle="offcanvas"
                    role="button"
                    aria-controls="offcanvasValidation"
                    data-toggle="tooltip"
                    title="Open Campaign"
                    data-boundary="window"
                    @click="triggerValidation(pav)"
                    ><i class="campaign blue"></i
                  ></a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DatasetValidationProgress } from "~/types/paged-validation";

const props = defineProps({
  dataset: {
    type: Object,
    required: true,
  },
});

const { toaster } = useToaster();
const emits = defineEmits(["validationClicked"]);

const { $getDatasetProgress } = useNuxtApp();
const { selectedCampaign } = storeToRefs(useSidebarDataStore());

const datasetPagedValidations = ref<DatasetValidationProgress[]>([]);

onMounted(async () => {
  await nextTick();
  const { data, error }: any = await $getDatasetProgress(
    selectedCampaign.value.id,
    props.dataset.id
  );
  if (error.value) {
    toaster.error(error.value.data.message);
    return;
  }
  datasetPagedValidations.value = data.value.data;
});

const getProperty = (property?: string) => property?.split("/")?.at(-1);

const getWidth = (accepted: number, total: number) => {
  return `width: ${(accepted / total) * 100}%`;
};

const getProgressAverage = computed(() => {
  if (datasetPagedValidations.value.length === 0) return 0;
  const sum = datasetPagedValidations.value.reduce((a, b) => {
    return (a += b.progress.progress ?? 0);
  }, 0);
  return sum / datasetPagedValidations.value.length;
});

const { selectValidation } = useSelectedValidation();
const triggerValidation = (pav: DatasetValidationProgress) => {
  selectValidation({ type: "editor", validation: pav });
  emits("validationClicked", props.dataset);
};
</script>

<style scoped>
.break-word {
  word-break: break-word;
}
.round-corners {
  border-radius: 5px !important;
}
.no-datasets {
  padding-bottom: 6px;
}
</style>
