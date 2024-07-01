<template>
  <div class="row">
    <div class="col-1 validation-list-number">
      <span class="counter">{{ index + 1 }}</span>
    </div>
    <div class="col-11">
      <div class="validation-header">
        <div class="validation-header-browse">
          <a href="#">
            {{ $t("validation_sidebar.browse_items") }}
          </a>
          <span class="counter">
            {{ props.pagedAnnotationValidation.count }}
          </span>
        </div>
        <div class="validation-header-action">
          <a @click="addNewAnnotationClicked">
            <i class="fa-solid fa-plus"></i>
            {{ $t("validation_sidebar.add_new_annotation") }}
          </a>
        </div>
      </div>
      <div class="validation-body">
        <div class="row">
          <div class="col-5">
            <div class="annotation-text">
              <div
                class="sticky-lexical"
                v-html="highlightLexical(props.pagedAnnotationValidation)"
              ></div>
              <span
                v-if="props.pagedAnnotationValidation.onValue.language"
                class="lang"
                data-toggle="tooltip"
                title="Language"
                data-boundary="window"
              >
                {{
                  props.pagedAnnotationValidation.onValue.language.toUpperCase()
                }}
              </span>
            </div>
          </div>
          <div class="col-7">
            <div class="annotation-entry-list">
              <ul>
                <NewAnnotation
                  v-for="ann of newAnnotations"
                  :key="ann.arrayIndex"
                  :new-annotation="ann"
                  :pav-id="props.pavId"
                  :rdf-vocabularies="props.rdfVocabularies"
                  :paged-annotation-validation="props.pagedAnnotationValidation"
                  @cancel="deleteNewAnnotation"
                  @handle-submit="handleNewAnnotation"
                />

                <li
                  v-for="(
                    annotation, idx
                  ) of props.pagedAnnotationValidation.details.filter(
                    (ann) => !ann.arrayIndex
                  )"
                  v-show="
                    !multipleAnnotationsWithUri(
                      props.pagedAnnotationValidation,
                      annotation
                    ) || !annotation.hide
                  "
                  :key="idx"
                  class="annotation-entry"
                  :class="getLabelColor(annotation) + '-label'"
                  @mouseover="
                    changeScale(
                      props.pagedAnnotationValidation,
                      annotation,
                      1.15
                    )
                  "
                  @mouseout="
                    changeScale(props.pagedAnnotationValidation, annotation, 1)
                  "
                >
                  <div class="annotation-entry-heading">
                    <div
                      class="title text-truncate"
                      :class="{
                        'rejected-by-me': annotation.state === 'REJECT',
                      }"
                    >
                      <a :href="annotation.value" target="_blank">{{
                        annotation.value
                      }}</a>
                    </div>
                    <div class="actionbar">
                      <ul v-if="annotation.references">
                        <li>
                          <a href="#"><span class="info"></span></a>
                        </li>
                      </ul>
                      <ul v-else>
                        <li
                          v-if="
                            multipleAnnotationsWithUri(
                              props.pagedAnnotationValidation,
                              annotation
                            ) &&
                            props.pagedAnnotationValidation.details.findIndex(
                              (ann) => ann.value === annotation.value
                            ) >= idx
                          "
                          class="layer"
                          :class="{
                            active:
                              props.pagedAnnotationValidation.details.some(
                                (annot) => annot.hide
                              ),
                          }"
                          @click="
                            layerClicked(
                              props.pagedAnnotationValidation,
                              annotation
                            )
                          "
                        >
                          <a class="sage-icon"><i class="layer"></i></a>
                        </li>
                        <li
                          v-if="annotation.state !== 'ADD'"
                          class="approve"
                          :class="{
                            approved:
                              annotation.state === 'ACCEPT' ||
                              annotation.state === 'ADD',
                          }"
                          @click="approveAnnotation(annotation)"
                        >
                          <a><i class="fa-solid fa-check"></i></a>
                        </li>
                        <li
                          v-if="annotation.state !== 'ADD'"
                          class="reject"
                          :class="{
                            rejected: annotation.state === 'REJECT',
                          }"
                          @click="rejectAnnotation(annotation)"
                        >
                          <a><i class="fa-solid fa-xmark"></i></a>
                        </li>
                        <li
                          v-if="annotation.state === 'ADD'"
                          class="added-by-me"
                        >
                          ADDED BY YOU
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div class="annotation-entry-content">
                    <div
                      v-if="annotation.score"
                      class="annotation-entry-score"
                      data-toggle="tooltip"
                      title="Annotation Score"
                      data-boundary="window"
                    >
                      <img src="@images/ic-score.svg" />{{
                        annotation.score.toFixed(2)
                      }}
                    </div>
                    <div
                      v-if="annotation.label.length > 0"
                      class="annotation-entry-details"
                    >
                      <h1>
                        {{ getAnnotationLabel(annotation.label[0].label) }}
                      </h1>
                      <p>
                        {{
                          getAnnotationDescription(
                            annotation.label[0].description
                          )
                        }}
                      </p>
                    </div>

                    <div
                      v-if="
                        annotation.state === 'ACCEPT' ||
                        annotation.state === 'ADD'
                      "
                      class="annotation-entry-export"
                    >
                      <!-- metadata-->
                      <ul class="export-list">
                        <li>
                          <span class="label">{{
                            $t("validation_sidebar.export_as")
                          }}</span>
                        </li>
                        <li>
                          <select
                            v-model="annotation.showTargetRdf"
                            class="filter-select form-select"
                            :class="{ disabled: annotation.state === 'ADD' }"
                            aria-label="mappingSample"
                            :disabled="annotation.state === 'ADD'"
                            @change="rdfVocabularyPrefixChanged(annotation)"
                          >
                            <option
                              v-for="rdf of props.rdfVocabularies"
                              :key="rdf.id"
                              :value="rdf"
                            >
                              {{ rdf.uriDescriptors[0].prefix }}
                            </option>
                          </select>
                        </li>
                        <li>
                          <select
                            v-model="annotation.showTargetProperty"
                            class="filter-select form-select"
                            :class="{ disabled: annotation.state === 'ADD' }"
                            aria-label="mappingSample"
                            :disabled="annotation.state === 'ADD'"
                          >
                            <option
                              v-for="property of annotation.showTargetRdf
                                .properties"
                              :key="property"
                              :value="property"
                            >
                              {{
                                property.split(annotation.lastSplitChar).at(-1)
                              }}
                            </option>
                          </select>
                        </li>
                      </ul>
                    </div>
                  </div>
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
import type { PropType } from "vue";
import type { AnnotationDetails } from "~/types/pageAnnotationValidation/Details";
import type { PagedAnnotationValidation } from "~/types/pageAnnotationValidation/PagedAnnotationValidation";

const props = defineProps({
  pavId: {
    type: String,
    required: true,
  },
  pagedAnnotationValidation: {
    type: Object as PropType<PagedAnnotationValidation>,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  rdfVocabularies: {
    type: Array,
    required: true,
  },
});

const newAnnotations = ref<AnnotationDetails[]>([]);
const newAnnotationsCount = ref<number>(1);

const addNewAnnotationClicked = () => {
  newAnnotations.value.push({ arrayIndex: newAnnotationsCount.value++ });
};

const deleteNewAnnotation = (idx: number) => {
  let index = newAnnotations.value.findIndex((ann) => idx === ann.arrayIndex);
  newAnnotations.value.splice(index, 1);
  index = props.pagedAnnotationValidation.details.findIndex(
    (ann: AnnotationDetails) => idx === ann.arrayIndex
  );
  if (index > -1) props.pagedAnnotationValidation.details.splice(index, 1);
};

const handleNewAnnotation = (ann: any) => {
  let index = newAnnotations.value.findIndex(
    (annotation) => ann.arrayIndex === annotation.arrayIndex
  );
  newAnnotations.value[index] = ann;
  index = props.pagedAnnotationValidation.details.findIndex(
    (annotation: AnnotationDetails) => ann.arrayIndex === annotation.arrayIndex
  );
  if (index >= 0) {
    props.pagedAnnotationValidation.details[index] = ann;
  } else {
    props.pagedAnnotationValidation.details.push(ann);
  }
};

const isString = (value: any) => typeof value === "string";

const findLastIndex = (str: string, char: string) => {
  let index = -1;
  for (let i = 0; i < str.length; i++) if (str[i] === char) index = i;
  return index;
};

const highlightLexical = (pagedAnnotationValidation: any) => {
  const discreteAnnotations: string[] = [];
  const nonHiddenExamined: string[] = [];
  let res = pagedAnnotationValidation.onValue.lexicalForm;

  for (const annotation of pagedAnnotationValidation.details) {
    if ((!annotation.start && annotation.start !== 0) || !annotation.end)
      continue;

    if (
      multipleAnnotationsWithUri(pagedAnnotationValidation, annotation) &&
      annotation.hide
    )
      continue;
    // Here we examine multiple annotations with the same URI that are no longer hidden
    if (discreteAnnotations.includes(annotation.value) && !annotation.hide) {
      // if we have examined a word already we do not do it again so that we do not create duplicate span elements
      if (nonHiddenExamined.includes(annotation.value)) continue;
      res = modifyLexical(pagedAnnotationValidation, annotation, res);
      nonHiddenExamined.push(annotation.value);
      continue;
    }
    const annotationLexical =
      pagedAnnotationValidation.onValue.lexicalForm.substring(
        annotation.start,
        annotation.end
      );
    const color = getLabelColor(annotation);
    const regex = new RegExp(`(${annotationLexical})`, "g");

    res = res.replace(
      regex,
      `<span class='highlight highlight-${props.index}-${annotation.start}-${
        annotation.end
      }-${annotation.value
        .split("/")
        .at(-1)} ${color}'>${annotationLexical}</span>`
    );
    discreteAnnotations.push(annotation.value);
  }
  return res;
};

const modifyLexical = (
  annotationValidation: PagedAnnotationValidation,
  annotation: AnnotationDetails,
  str: string
) => {
  const annotationsToModify = annotationValidation.details.filter(
    (ann) => ann.value === annotation.value
  );

  // we replace the instances of the word (e.g. <span class"highlight-start-end-value">...) in the current res ( str )
  // with the new class (e.g. <span class="highlight-newStart-newEnd-value"...) .
  // Because we replace one instance at a time, each time we replace the 2nd instance of the word (first is the first annotation that is always non hidden)
  for (let i = 1; i < annotationsToModify.length; i++) {
    const search = `highlight-${props.index}-${annotationsToModify[0].start}-${
      annotationsToModify[0].end
    }-${annotation.value.split("/").at(-1)}`;
    const replaceWith = `highlight-${props.index}-${
      annotationsToModify[i].start
    }-${annotationsToModify[i].end}-${annotation.value.split("/").at(-1)}`;
    str = str.replace(RegExp(`^(?:.*?${search}){${2}}`), function (x) {
      return x.replace(RegExp(search + "$"), replaceWith);
    });
  }
  return str;
};

const layerClicked = (
  pagedAnnotationValidation: PagedAnnotationValidation,
  annotation: AnnotationDetails
) => {
  pagedAnnotationValidation.details
    .filter((annot) => annot.value === annotation.value)
    .forEach((an, index) => {
      if (index === 0) an.hide = false;
      else {
        an.hide = !an.hide;
      }
    });
};

const changeScale = (
  pagedAnnotationValidation: any,
  annotation: any,
  scale: number
) => {
  const elements = document.getElementsByClassName(
    `highlight-${props.index}-${annotation.start}-${
      annotation.end
    }-${annotation.value.split("/").at(-1)}`
  );
  if (!elements.length) return;
  if (!pagedAnnotationValidation.details.some((annot: any) => annot.hide)) {
    const myAnnotations = pagedAnnotationValidation.details.filter(
      (annot: any) => annot.value === annotation.value
    );
    const index = myAnnotations.findIndex(
      (ann: any) => ann.start === annotation.start
    );
    elements[index].style.transform = `scale(${scale})`;
    return;
  }
  for (const el of elements) {
    el.style.transform = `scale(${scale})`;
  }
};

const getLabelColor = (annotation: any) => {
  if (annotation.references) return "orange";
  if (annotation.othersAccepted > annotation.othersRejected) return "green";
  else if (annotation.othersAccepted < annotation.othersRejected) return "red";
  else return "blue";
};

const getAnnotationDescription = (description: any) => {
  if (!description) return "";
  if (isString(description[0])) return description[0];
  return description.find((desc: any) => desc.language === "en").value;
};
const getAnnotationLabel = (label: any) => {
  if (isString(label[0])) return label[0];
  return label.find((lbl: any) => lbl.language === "en").value;
};

const multipleAnnotationsWithUri = (
  pagedAnnotationValidation: any,
  annotation: any
) => {
  return (
    pagedAnnotationValidation.details.filter(
      (ann: any) => ann.value === annotation.value
    ).length > 1
  );
};

const rdfVocabularyPrefixChanged = (annotation: any) => {
  annotation.showTargetProperty = annotation.showTargetRdf.properties[0];
  const slashIndex = findLastIndex(annotation.showTargetProperty, "/");
  const hashmarkIndex = findLastIndex(annotation.showTargetProperty, "#");
  annotation.lastSplitChar = "/";
  if (hashmarkIndex > slashIndex) annotation.lastSplitChar = "#";
};

const rejectAnnotation = (annotation: any) => {
  if (annotation.state === "REJECT") {
    annotation.state = undefined;
  } else {
    annotation.state = "REJECT";
  }
};
const approveAnnotation = (annotation: any) => {
  if (annotation.state === "ACCEPT") {
    annotation.state = undefined;
  } else {
    annotation.state = "ACCEPT";
  }
};
</script>

<style scoped lang="scss">
.insert-text {
  color: #0c325c;
  margin-bottom: 0.3rem;
}
.filter-select {
  width: fit-content !important;
  &.disabled {
    cursor: not-allowed;
  }
}
.added-by-me {
  padding: 2px 10px;
  background-color: #0c325c;
  color: white;
  font-size: 11px;
  border-radius: 40px;
}
.sticky-lexical {
  position: sticky;
  top: 124px;
}
</style>
