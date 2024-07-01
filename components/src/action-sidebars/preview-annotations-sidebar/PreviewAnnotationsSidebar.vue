<template>
  <div
    id="offcanvasPreviewAnnotations"
    ref="previewAnnotationsCanvas"
    class="offcanvas offcanvas-end offcanvas-size-xl"
    data-bs-backdrop="false"
    tabindex="-1"
    aria-labelledby="offcanvasPreviewAnnotationsLabel"
  >
    <div class="offcanvas-header">
      <div class="offcanvas-headerinfo">
        <h4 id="offcanvasExampleLabel" class="offcanvas-title">
          {{ $t("validation_sidebar.validation") }}
        </h4>
      </div>
      <ul class="offcanvas-action">
        <li>
          <NuxtLink @click="closeSidebar">
            {{ $t("close") }}
          </NuxtLink>
        </li>
      </ul>
    </div>
    <div v-if="!loading" class="offcanvas-body clear">
      <div class="activity">
        <div class="filter-section validation sticky-top">
          <ul
            v-if="annotationValidations.length !== 0"
            class="filter-pagination"
          >
            <li
              class="previous"
              :class="{ 'disabled-btn': pagination.currentPage <= 1 }"
            >
              <a @click="shiftPage('LEFT')">
                <i class="fa-solid fa-angle-left"></i>
              </a>
            </li>
            <li class="info">
              {{ $t("pagination.page") }}
              {{ pagination.currentPage }}
              {{ $t("pagination.of") }} {{ pagination.totalPages }}
            </li>
            <li
              class="next"
              :class="{
                'disabled-btn':
                  pagination.currentPage === pagination.totalPages,
              }"
            >
              <a @click="shiftPage('RIGHT')">
                <i class="fa-solid fa-angle-right"></i>
              </a>
            </li>
          </ul>
          <ul
            v-if="annotationValidations.length !== 0"
            class="filter-pagination clear"
          >
            <li class="goto">
              {{ $t("validation_sidebar.go_to") }}
              <input
                v-model="specificPage"
                class="form-control"
                type="number"
                min="0"
                :max="pagination.totalPages"
                :disabled="pagination.totalPages <= 1"
                @keydown.enter="goToPage()"
              />
              <a class="px-0" @click="goToPage">↵</a>
            </li>
          </ul>
        </div>
        <div v-if="annotationValidations.length === 0" class="no-data">
          <h5>
            {{ $t("validation_sidebar.no_data") }}
          </h5>
        </div>
        <div v-else class="validation-list">
          <ul>
            <li
              v-for="(
                pagedAnnotationValidation, index
              ) of annotationValidations"
              :key="index"
              class="validation-list-entry"
            >
              <PreviewAnnotation
                :annotation-validation="pagedAnnotationValidation"
                :index="index"
              />
            </li>
          </ul>
        </div>
      </div>
    </div>
    <PageSpinner v-else />
  </div>
</template>
<script setup lang="ts">
import type { AnnotationDetails } from "~/types/pageAnnotationValidation/Details";
import type { PagedAnnotationValidation } from "~/types/pageAnnotationValidation/PagedAnnotationValidation";
import type { Pagination } from "~/types/Pagination";
const { t } = useI18n();
const { toaster } = useToaster();
const { $annotatorApi } = useNuxtApp();
const { selectedAnnotator, deselectAnnotator } = useSelectedAnnotator();

const annotationValidations = ref<PagedAnnotationValidation[]>([]);
const loading = ref<boolean>(true);
const pagination = ref<Pagination>({} as Pagination);
const specificPage = ref<number | null | undefined>();

watchEffect(() => {
  if (selectedAnnotator.value?.id) {
    getAnnotations(1);
  }
});

const multipleAnnotationsWithUri = (
  annotationValidation: any,
  annotation: any
) => {
  return (
    annotationValidation.details.filter(
      (ann: any) => ann.value === annotation.value
    ).length > 1
  );
};

const getAnnotations = async (page: number) => {
  if (!selectedAnnotator.value?.id) {
    return;
  }
  loading.value = true;
  const { data, error }: any = await $annotatorApi.previewAnnotations(
    selectedAnnotator.value.id,
    page
  );
  if (error.value) {
    throw new Error(error.value.message);
  }
  annotationValidations.value = data.value.data;
  pagination.value = data.value.pagination;
  if (data.value.errorMessage === "NO_PAGE_FOUND") {
    loading.value = false;
    return;
  }
  annotationValidations.value.forEach((pavv: any) => {
    pavv.details.sort((ann1: any, ann2: any) => {
      if (!ann1.start && ann1.start !== 0) return 0;
      if (!ann2.start && ann2.start !== 0) return 0;
      if (ann1.start > ann2.start) return 1;
      if (ann1.start < ann2.start) return -1;
      return 0;
    });
  });

  annotationValidations.value?.forEach(
    (pagedAnnotationValidation: PagedAnnotationValidation) => {
      pagedAnnotationValidation.details.forEach(
        (annotation: AnnotationDetails, index) => {
          annotation.hide = false;
          if (
            multipleAnnotationsWithUri(pagedAnnotationValidation, annotation) &&
            pagedAnnotationValidation.details.findIndex(
              (ann) => ann.value === annotation.value
            ) < index
          )
            annotation.hide = true;
        }
      );
    }
  );
  if (data.value?.errorMessage === "redirect") {
    toaster.error(t("validation_sidebar.no_data_first_available"));
  }
  loading.value = false;
};
const previewAnnotationsCanvas = ref(null);

const reset = () => {
  deselectAnnotator();
  specificPage.value = null;
  pagination.value = {} as Pagination;
};

const closeSidebar = () => {
  reset();
  hideOffcanvas(previewAnnotationsCanvas);
};

const shiftPage = (direction: string) => {
  const illegalShift =
    direction === "LEFT"
      ? pagination.value.currentPage <= 1
      : pagination.value.currentPage === pagination.value.totalPages;
  if (illegalShift) return;
  if (direction === "RIGHT") getAnnotations(pagination.value.currentPage + 1);
  else getAnnotations(pagination.value.currentPage - 1);
};

const goToPage = () => {
  if (
    (specificPage.value as number) < 1 ||
    (specificPage.value as number) > pagination.value.totalPages
  ) {
    toaster.error(
      `${t("validation_sidebar.type_page_in_range")} (1${
        pagination.value.totalPages > 1 ? "-" + pagination.value.totalPages : ""
      })`
    );
    return;
  }
  getAnnotations(specificPage.value as number);
};
</script>
<style lang="scss" scoped>
#offcanvasPreviewAnnotations {
  width: calc(100vw - 80px);
}
.no-data {
  padding: 30px 20px;
}
.filter-section {
  display: flex;
  justify-content: flex-end;
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
