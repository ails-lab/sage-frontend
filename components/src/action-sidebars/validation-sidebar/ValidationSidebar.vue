<template>
  <CloseSidebarModal
    :message="`If you close the validation process any unsaved changed will be lost.`"
    @confirm="removeLock"
  />
  <div
    id="offcanvasValidation"
    ref="validationCanvas"
    class="offcanvas offcanvas-end offcanvas-size-xl"
    data-bs-backdrop="false"
    tabindex="-1"
    aria-labelledby="offcanvasValidationLabel"
  >
    <div class="offcanvas-header">
      <div class="offcanvas-headerinfo">
        <h4 id="offcanvasExampleLabel" class="offcanvas-title">
          {{ $t("validation_sidebar.validation") }}
        </h4>
      </div>
      <ul class="offcanvas-action">
        <li>
          <NuxtLink @click="closeSidebarModal.show()">
            {{ $t("close") }}
          </NuxtLink>
        </li>
        <li class="main">
          <NuxtLink @click="checkBeforeSave">
            {{ $t("save") }}
          </NuxtLink>
        </li>
      </ul>
    </div>
    <div v-if="!loading" class="offcanvas-body clear">
      <div class="activity">
        <ValidationDetails
          :dataset-name="dataset.name"
          :property-name="propertyName"
          :progress="pavProgress"
          :time="time"
          @timer-finish="removeLock"
        />
        <ValidationFilters
          :current-page="annotationValidations.currentPage"
          :total-pages="annotationValidations.totalPages"
          :validation-filter="validationFilter"
          :annotation-filter="annotationFilter"
          @annotation-filter-changed="annotationFilterChanged"
          @validation-filter-changed="validationFilterChanged"
          @change-page="changePage"
        />
        <div
          v-if="
            annotationValidations.errorMessage === 'NO_PAGE_FOUND' ||
            annotationValidations.data.length === 0
          "
          class="no-data"
        >
          <h5>
            {{ $t("validation_sidebar.no_data") }}
          </h5>
        </div>
        <div v-else class="validation-list">
          <ul>
            <li
              v-for="(
                pagedAnnotationValidation, index
              ) of annotationValidationsForEdit.data"
              :key="index"
              class="validation-list-entry"
            >
              <ValidationAnnotation
                :pav-id="pav.id"
                :paged-annotation-validation="pagedAnnotationValidation"
                :index="index"
                :rdf-vocabularies="rdfVocabularies"
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
import type { AnnotationDetails } from "@/types/pageAnnotationValidation/Details";
import type { PagedAnnotationValidation } from "@/types/pageAnnotationValidation/PagedAnnotationValidation";
import type { PagedAnnotationValidationDTO } from "@/types/pageAnnotationValidation/pagedAnnotationValidationDTO";
const { t } = useI18n();
const { toaster } = useToaster();
const { rdfVocabularies } = storeToRefs(useCurrentInstanceInfoStore());

defineProps({
  dataset: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(["clearPav"]);
const { $pavApi, $bootstrap } = useNuxtApp();
const { showConfirmModal } = useModalsStore();
const pavProgress = ref();
const specificPage = ref<number | null | undefined>();

const { selectedValidation, deselectValidation } = useSelectedValidation();
const pav = computed(() => selectedValidation.value?.validation);
const propertyName = computed(() => selectedValidation.value?.propertyName);

const annotationValidations = ref<PagedAnnotationValidationDTO>(
  {} as PagedAnnotationValidationDTO
);
const annotationValidationsForEdit = ref<PagedAnnotationValidationDTO>(
  {} as PagedAnnotationValidationDTO
);
const validationFilter = ref<"SERIAL" | "NOT_COMPLETE" | "NOT_VALIDATED">(
  "SERIAL"
);
const annotationFilter = ref<"ANNOTATED_ONLY" | "UNANNOTATED_ONLY">(
  "ANNOTATED_ONLY"
);
const editedAnnotations = ref<{}[]>([]);
const time = ref<number>(30 * 60 * 1000 - 1);
const loading = ref<boolean>(true);
const closeSidebarModal = ref();
const validationCanvas = ref(null);
onMounted(() => {
  closeSidebarModal.value = new $bootstrap.Modal(
    document.getElementById("close-sidebar-modal")
  );
});
const getPavPage = async (
  currentPage: number,
  mode: string,
  navigation: string,
  requestedPage: number | null | undefined
) => {
  if (!pav.value?.id) return;

  loading.value = true;
  const regex = /.*_SPECIFIC_PAGE$/;
  const queryParams = {
    ...(regex.test(mode) ? { requestedPage } : { navigation }),
    mode,
    currentPage,
  };
  const { data, error }: any = await $pavApi.getPavPage(
    pav.value.id,
    queryParams
  );
  if (error.value) {
    console.error(error.value);
    return;
  }
  await getPavProgress();
  annotationValidations.value = JSON.parse(JSON.stringify(data.value));
  annotationValidationsForEdit.value = JSON.parse(JSON.stringify(data.value));
  if (data.value.errorMessage === "NO_PAGE_FOUND") {
    loading.value = false;
    return;
  }
  annotationValidations.value?.data.forEach((pavv) => {
    pavv.details.sort((ann1, ann2) => {
      if (!ann1.start && ann1.start !== 0) return 0;
      if (!ann2.start && ann2.start !== 0) return 0;
      if (ann1.start > ann2.start) return 1;
      if (ann1.start < ann2.start) return -1;
      return 0;
    });
  });
  annotationValidationsForEdit.value?.data.forEach((pavv) => {
    pavv.details.sort((ann1, ann2) => {
      if (!ann1.start && ann1.start !== 0) return 0;
      if (!ann2.start && ann2.start !== 0) return 0;
      if (ann1.start > ann2.start) return 1;
      if (ann1.start < ann2.start) return -1;
      return 0;
    });
  });
  fillTargetInAnnotations();
  if (annotationValidations.value?.errorMessage === "redirect") {
    toaster.error(t("validation_sidebar.no_data_first_available"));
  }
  time.value = 30 * 60 * 1000 - 1;
  loading.value = false;
};
const fillTargetInAnnotations = () => {
  annotationValidationsForEdit.value?.data.forEach(
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
          if (annotation.selectedTarget)
            annotation.showTargetProperty = annotation.selectedTarget;
          else if (annotation.othersTarget) {
            annotation.selectedTarget = annotation.othersTarget;
            annotation.showTargetProperty = annotation.othersTarget;
          } else if (annotation.defaultTargets) {
            annotation.selectedTarget = annotation.defaultTargets[0];
            annotation.showTargetProperty = annotation.defaultTargets[0];
          } else
            annotation.showTargetProperty = "http://purl.org/dc/terms/abstract";
          const slashIndex = findLastIndex(annotation.showTargetProperty, "/");
          const hashmarkIndex = findLastIndex(
            annotation.showTargetProperty,
            "#"
          );
          annotation.lastSplitChar = "/";
          if (hashmarkIndex > slashIndex) annotation.lastSplitChar = "#";
          annotation.showTargetRdf = rdfVocabularies.value.find(
            (rdf: any) =>
              rdf.uriDescriptors[0].namespace ===
              annotation.showTargetProperty?.slice(
                0,
                Math.max(hashmarkIndex, slashIndex) + 1
              )
          );
          annotation.properties = annotation.showTargetRdf.properties;
        }
      );
    }
  );
};
const findLastIndex = (str: string, char: string) => {
  let index = -1;
  for (let i = 0; i < str.length; i++) if (str[i] === char) index = i;
  return index;
};
const multipleAnnotationsWithUri = (
  pagedAnnotationValidation: PagedAnnotationValidation,
  annotation: AnnotationDetails
) => {
  return (
    pagedAnnotationValidation.details.filter(
      (ann) => ann.value === annotation.value
    ).length > 1
  );
};
const changePage = (
  currentPage: number,
  mode: string,
  navigation: string,
  specificPage: number
) => {
  commitChanges();
  getPavPage(currentPage, mode, navigation, specificPage);
};
const annotationFilterChanged = (
  filter: "ANNOTATED_ONLY" | "UNANNOTATED_ONLY"
) => {
  annotationFilter.value = filter;
};
const validationFilterChanged = (
  filter: "SERIAL" | "NOT_COMPLETE" | "NOT_VALIDATED"
) => {
  validationFilter.value = filter;
};
const commitChanges = async () => {
  editedAnnotations.value = [];
  for (
    let pavIdx = 0;
    pavIdx < annotationValidationsForEdit.value.data.length;
    pavIdx++
  ) {
    for (
      let annIdx = 0;
      annIdx < annotationValidationsForEdit.value?.data[pavIdx].details.length;
      annIdx++
    ) {
      const annotation =
        annotationValidations.value.data[pavIdx].details[annIdx];
      const newAnnotation =
        annotationValidationsForEdit.value?.data[pavIdx].details[annIdx];
      let indexOfAnnotationInEdit = editedAnnotations.value.findIndex(
        (edited) =>
          edited.propertyValue.lexicalForm ===
          annotationValidations.value.data[pavIdx].onValue.lexicalForm
      );
      let editBody;
      if (newAnnotation.state === "ADD" && !annotation) {
        editBody = {
          annotationValue: newAnnotation.label[0].id,
          editType: "ADD",
          start: -1,
          end: -1,
          count: annotationValidations.value.data[pavIdx].count,
          target: newAnnotation.showTargetProperty,
        };
        if (indexOfAnnotationInEdit >= 0) {
          editedAnnotations.value[indexOfAnnotationInEdit].edits.push(editBody);
        } else {
          const onValue = annotationValidations.value.data[pavIdx].onValue;
          editedAnnotations.value.push({
            edits: [editBody],
            propertyValue: onValue,
          });
        }
        continue;
      }
      const id = annotation.id;
      if (annotation.state === newAnnotation.state) {
        if (
          annotation.state === "ACCEPT" &&
          newAnnotation.state === "ACCEPT" &&
          newAnnotation.selectedTarget !== newAnnotation.showTargetProperty
        ) {
          editBody = {
            id,
            editType: "CHANGE_TARGET",
            target: newAnnotation.showTargetProperty,
          };
          if (indexOfAnnotationInEdit >= 0) {
            editedAnnotations.value[indexOfAnnotationInEdit].edits.push(
              editBody
            );
          } else {
            const onValue = annotationValidations.value.data[pavIdx].onValue;
            editedAnnotations.value.push({
              edits: [editBody],
              propertyValue: onValue,
            });
          }
        }
        continue;
      }
      // if annotation.state is undefined/empty we create a new edit with the editType
      if (!annotation.state) {
        // if id exists we just need to send this
        // else we create an object with all the values from annotation.details
        if (id) {
          editBody = {
            id,
            ...(newAnnotation.state === ""
              ? {}
              : { editType: newAnnotation.state }),
            ...(newAnnotation.state === "ACCEPT"
              ? { target: newAnnotation.showTargetProperty }
              : {}),
          };
        } else {
          editBody = {
            annotationValue: annotation.value,
            ...(newAnnotation.state === ""
              ? {}
              : { editType: newAnnotation.state }),
            start: annotation.start,
            end: annotation.end,
            count: annotation.count,
            ...(newAnnotation.state === "ACCEPT"
              ? { target: newAnnotation.showTargetProperty }
              : {}),
          };
        }
        // if we have already created an array element for this lexical we push the new edit in the existing one
        if (indexOfAnnotationInEdit >= 0) {
          editedAnnotations.value[indexOfAnnotationInEdit].edits.push(editBody);
        }
        // else we create a new array element with the new lexical and edit
        else {
          const onValue = annotationValidations.value.data[pavIdx].onValue;
          editedAnnotations.value.push({
            edits: [editBody],
            propertyValue: onValue,
          });
        }
        continue;
      }
      // if annotation.state is not undefined/empty we need to create an edit with editType='' to empty the old vote
      // and if we have reversed the vote we create a new edit with the new one (check the next if).
      if (id) {
        editBody = {
          id,
        };
      } else {
        editBody = {
          annotationValue: annotation.value,
          start: annotation.start,
          end: annotation.end,
          count: annotation.count,
        };
      }
      if (indexOfAnnotationInEdit >= 0) {
        editedAnnotations.value[indexOfAnnotationInEdit].edits.push(editBody);
      } else {
        const onValue = annotationValidations.value.data[pavIdx].onValue;
        editedAnnotations.value.push({
          edits: [editBody],
          propertyValue: onValue,
        });
      }
      if (newAnnotation.state !== undefined) {
        editBody = {
          annotationValue: annotation.value,
          ...(newAnnotation.state === ""
            ? {}
            : { editType: newAnnotation.state }),
          start: annotation.start,
          end: annotation.end,
          count: annotation.count,
          ...(newAnnotation.state === "ACCEPT"
            ? { target: newAnnotation.showTargetProperty }
            : {}),
        };
        // we do not need to check if the lexical exists because we already created an edit with editType='' for this lexical
        indexOfAnnotationInEdit = editedAnnotations.value.findIndex(
          (edited) =>
            edited.propertyValue.lexicalForm ===
            annotationValidations.value.data[pavIdx].onValue.lexicalForm
        );
        editedAnnotations.value[indexOfAnnotationInEdit].edits.push(editBody);
      }
    }
  }
  if (editedAnnotations.value.length)
    await $pavApi.commitPage(
      annotationValidations.value.pagedAnnotationValidationPageId,
      annotationValidations.value.lockId,
      editedAnnotations.value
    );
};
const checkBeforeSave = () => {
  showConfirmModal(
    t("validation_sidebar.unchecked_new_annotations_alert"),
    saveChanges
  );
};
const saveChanges = async () => {
  await commitChanges();
  getPavPage(
    annotationValidations.value.currentPage,
    `${annotationFilter.value}_SPECIFIC_PAGE`,
    "",
    annotationValidations.value.currentPage
  );
};
const removeLock = () => {
  if (!pav.value?.id) return;

  $pavApi.removeLock(
    pav.value.id,
    annotationFilter.value,
    annotationValidations.value.currentPage
  );

  deselectValidation();
  hideOffcanvas(validationCanvas);
  emit("clearPav");
};
const resetRefs = () => {
  specificPage.value = null;
  validationFilter.value = "SERIAL";
  annotationFilter.value = "ANNOTATED_ONLY";
  editedAnnotations.value = [];
};
const getPavProgress = async () => {
  if (!pav.value?.id) return;

  const { data }: any = await $pavApi.getPavProgress(pav.value.id);
  pavProgress.value = data.value.data.progress;
};
watchEffect(() => {
  if (pav.value?.id && selectedValidation.value?.type === "editor") {
    resetRefs();
    getPavPage(0, "ANNOTATED_ONLY_SERIAL", "RIGHT", -1);
  }
});
</script>
<style lang="scss" scoped>
#offcanvasValidation {
  width: calc(100vw - 80px);
}
.no-data {
  padding: 30px 20px;
}
.rejected-by-me {
  text-decoration: line-through !important;
}
</style>
