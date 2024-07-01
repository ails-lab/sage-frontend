<template>
  <div class="filter-section validation sticky-top space">
    <ul class="filter-pagination">
      <li class="previous" :class="{ 'disabled-btn': props.currentPage <= 1 }">
        <a @click="shiftPage('LEFT')">
          <i class="fa-solid fa-angle-left"></i>
        </a>
      </li>
      <li class="info">
        {{ $t("pagination.page") }}
        {{ props.currentPage }}
        {{ $t("pagination.of") }} {{ props.totalPages }}
      </li>
      <li
        class="next"
        :class="{ 'disabled-btn': props.currentPage === props.totalPages }"
      >
        <a @click="shiftPage('RIGHT')">
          <i class="fa-solid fa-angle-right"></i>
        </a>
      </li>
    </ul>
    <ul class="filter-pagination clear">
      <li class="goto">
        {{ $t("validation_sidebar.go_to") }}
        <input
          v-model="specificPage"
          class="form-control"
          type="number"
          min="0"
          :max="props.totalPages"
          :disabled="props.totalPages <= 1"
          @keydown.enter="goToPage()"
        />
        <a class="px-0" @click="goToPage">↵</a>
      </li>
    </ul>
    <ul class="filter-list">
      <li v-if="props.annotationFilter !== 'UNANNOTATED_ONLY'">
        <select
          v-model="valFilter"
          class="filter-select form-select"
          aria-label="mappingSample"
          @change="validationFilterChanged"
        >
          <option selected value="SERIAL">
            {{ $t("validation_sidebar.all") }}
          </option>
          <option value="NOT_COMPLETE">
            {{ $t("validation_sidebar.partially_validated") }}
          </option>
          <option value="NOT_VALIDATED">
            {{ $t("validation_sidebar.not_validated") }}
          </option>
        </select>
      </li>
      <li>
        <ul class="form-filter">
          <li
            :class="{ selected: props.annotationFilter === 'ANNOTATED_ONLY' }"
          >
            <a @click="annotationFilterChanged('ANNOTATED_ONLY')">{{
              $t("validation_sidebar.annotated")
            }}</a>
          </li>
          <li
            :class="{
              selected: props.annotationFilter === 'UNANNOTATED_ONLY',
            }"
          >
            <a @click="annotationFilterChanged('UNANNOTATED_ONLY')">{{
              $t("validation_sidebar.not_annotated")
            }}</a>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const { toaster } = useToaster();

const props = defineProps({
  totalPages: {
    type: Number,
    required: true,
  },
  currentPage: {
    type: Number,
    required: true,
  },
  annotationFilter: {
    type: String,
    required: true,
  },
  validationFilter: {
    type: String,
    required: true,
  },
});

const emit = defineEmits([
  "changePage",
  "annotationFilterChanged",
  "validationFilterChanged",
]);

const valFilter = ref<string>("SERIAL");
const specificPage = ref<number | null | undefined>();

onMounted(() => {
  valFilter.value = props.validationFilter;
});

const shiftPage = (direction: string) => {
  const illegalShift =
    direction === "LEFT"
      ? props.currentPage <= 1
      : props.currentPage === props.totalPages;
  if (illegalShift) return;
  emit(
    "changePage",
    props.currentPage,
    `${props.annotationFilter}_${props.validationFilter}`,
    direction,
    -1
  );
};
const goToPage = () => {
  if (specificPage.value < 1 || specificPage.value > props.totalPages) {
    toaster.error(
      `${t("validation_sidebar.type_page_in_range")} (1${
        props.totalPages > 1 ? "-" + props.totalPages : ""
      })`
    );
    return;
  }
  emit(
    "changePage",
    props.currentPage,
    `${props.annotationFilter}_SPECIFIC_PAGE`,
    "",
    specificPage.value
  );
};
const annotationFilterChanged = (
  annFilter: "ANNOTATED_ONLY" | "UNANNOTATED_ONLY"
) => {
  emit("annotationFilterChanged", annFilter);
  specificPage.value = null;
  if (annFilter === "UNANNOTATED_ONLY") {
    valFilter.value = "SERIAL";
    emit("validationFilterChanged", "SERIAL");
  }
  emit("changePage", 0, `${annFilter}_${valFilter.value}`, "RIGHT", -1);
};
const validationFilterChanged = () => {
  emit("validationFilterChanged", valFilter.value);
  specificPage.value = null;
  emit(
    "changePage",
    0,
    `${props.annotationFilter}_${valFilter.value}`,
    "RIGHT",
    -1
  );
};
</script>

<style lang="scss" scoped>
.form-filter {
  .selected {
    border: 1px solid #869fbb;
  }
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}

.filter-pagination .previous,
.filter-pagination .next {
  a {
    border: 1px solid #dee2e6;
  }
}

.disabled-btn {
  color: #777;
  a {
    background-color: unset !important;
    cursor: default !important;
    border: unset !important;
  }
}
</style>
