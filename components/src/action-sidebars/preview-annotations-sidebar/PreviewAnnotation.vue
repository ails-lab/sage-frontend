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
            {{ props.annotationValidation.count }}
          </span>
        </div>
      </div>
      <div class="validation-body">
        <div class="row">
          <div class="col-5">
            <div class="annotation-text">
              <div
                class="sticky-lexical"
                v-html="highlightLexical(props.annotationValidation)"
              ></div>
              <span
                v-if="props.annotationValidation.onValue.language"
                class="lang"
                data-toggle="tooltip"
                title="Language"
                data-boundary="window"
              >
                {{ props.annotationValidation.onValue.language.toUpperCase() }}
              </span>
            </div>
          </div>
          <div class="col-7">
            <div class="annotation-entry-list">
              <ul>
                <li
                  v-for="(
                    annotation, idx
                  ) of props.annotationValidation.details.filter(
                    (ann) => !ann.arrayIndex
                  )"
                  v-show="
                    !multipleAnnotationsWithUri(
                      props.annotationValidation,
                      annotation
                    ) || !annotation.hide
                  "
                  :key="idx"
                  class="annotation-entry"
                  :class="getLabelColor(annotation) + '-label'"
                  @mouseover="
                    changeScale(props.annotationValidation, annotation, 1.15)
                  "
                  @mouseout="
                    changeScale(props.annotationValidation, annotation, 1)
                  "
                >
                  <div class="annotation-entry-heading">
                    <div
                      class="title text-truncate"
                      :class="{
                        'rejected-by-me': annotation.state === 'REJECT',
                      }"
                    >
                      <a href="#" target="_blank">{{ annotation.value }}</a>
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
                              props.annotationValidation,
                              annotation
                            ) &&
                            props.annotationValidation.details.findIndex(
                              (ann) => ann.value === annotation.value
                            ) >= idx
                          "
                          class="layer"
                          :class="{
                            active: props.annotationValidation.details.some(
                              (annot) => annot.hide
                            ),
                          }"
                          @click="
                            layerClicked(props.annotationValidation, annotation)
                          "
                        >
                          <a class="sage-icon"><i class="layer"></i></a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div class="annotation-entry-content">
                    <div
                      v-if="annotation.score"
                      class="annotation-entry-score"
                      :class="{ 'no-label': !annotation.label?.length }"
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
  annotationValidation: {
    type: Object as PropType<PagedAnnotationValidation>,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
});

const isString = (value: any) => typeof value === "string";

const highlightLexical = (annotationValidation: any) => {
  const discreteAnnotations: string[] = [];
  const nonHiddenExamined: string[] = [];
  let res = annotationValidation.onValue.lexicalForm;

  for (const annotation of annotationValidation.details) {
    if ((!annotation.start && annotation.start !== 0) || !annotation.end)
      continue;

    if (
      multipleAnnotationsWithUri(annotationValidation, annotation) &&
      annotation.hide
    )
      continue;

    // Here we examine multiple annotations with the same URI that are no longer hidden
    if (discreteAnnotations.includes(annotation.value) && !annotation.hide) {
      // if we have examined a word already we do not do it again so that we do not create duplicate span elements
      if (nonHiddenExamined.includes(annotation.value)) continue;
      res = modifyLexical(annotationValidation, annotation, res);
      nonHiddenExamined.push(annotation.value);
      continue;
    }
    const annotationLexical =
      annotationValidation.onValue.lexicalForm.substring(
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
  annotationValidation: any,
  annotation: any,
  scale: number
) => {
  const elements = document.getElementsByClassName(
    `highlight-${props.index}-${annotation.start}-${
      annotation.end
    }-${annotation.value.split("/").at(-1)}`
  );
  if (!elements.length) return;
  if (!annotationValidation.details.some((annot: any) => annot.hide)) {
    const myAnnotations = annotationValidation.details.filter(
      (annot: any) =>
        annot.value === annotation.value &&
        annot.start === annotation.start &&
        annot.end === annotation.end
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
  annotationValidation: any,
  annotation: any
) => {
  return (
    annotationValidation.details.filter(
      (ann: any) => ann.value === annotation.value
    ).length > 1
  );
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
.no-label {
  top: 5px !important;
}
.sticky-lexical {
  position: sticky;
  top: 124px;
}
</style>
