<template>
  <li class="annotation-entry">
    <div class="annotation-entry-heading new">
      <p class="insert-text">
        {{ $t("validation_sidebar.insert_new_annotation") }}
      </p>
      <div class="d-flex justify-content-between col-12">
        <input v-model="newAnnotationUri" class="col-8" />
        <div class="col-4 d-flex justify-content-end">
          <a class="search-btn mx-1" @click="searchURI">
            {{ $t("check") }}
          </a>
          <a @click="emit('cancel', newAnnotation.arrayIndex)">
            {{ $t("cancel") }}
          </a>
        </div>
      </div>
      <div v-if="newAnnotationError" class="error-text">
        {{ newAnnotationError }}
      </div>
    </div>
    <div v-if="showNewAnnotationDetails" class="annotation-entry-content">
      <div class="annotation-entry-details">
        <h1>
          {{ getAnnotationLabel(newAnnotation?.label?.[0].label) }}
        </h1>
        <p>
          {{ getAnnotationDescription(newAnnotation?.label?.[0].description) }}
        </p>
      </div>

      <div class="annotation-entry-export">
        <!-- metadata-->
        <ul class="export-list">
          <li>
            <span class="label">{{ $t("validation_sidebar.export_as") }}</span>
          </li>
          <li>
            <select
              v-model="newAnnotation.showTargetRdf"
              class="filter-select form-select"
              aria-label="mappingSample"
              @change="rdfVocabularyPrefixChanged(newAnnotation)"
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
              v-model="newAnnotation.showTargetProperty"
              class="filter-select form-select"
              aria-label="mappingSample"
              @change="emit('handleSubmit', newAnnotation)"
            >
              <option
                v-for="property of newAnnotation.showTargetRdf.properties"
                :key="property"
                :value="property"
              >
                {{ property.split(newAnnotation.lastSplitChar).at(-1) }}
              </option>
            </select>
          </li>
        </ul>
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
import type { PropType } from "vue";
import type { AnnotationDetails } from "~/types/pageAnnotationValidation/Details";
import type { PagedAnnotationValidation } from "~/types/pageAnnotationValidation/PagedAnnotationValidation";
const { t } = useI18n();

const { $pavApi } = useNuxtApp();
const props = defineProps({
  newAnnotation: {
    type: Object as PropType<AnnotationDetails>,
    required: true,
  },
  pavId: {
    type: String,
    required: true,
  },
  pagedAnnotationValidation: {
    type: Object as PropType<PagedAnnotationValidation>,
    required: true,
  },
  rdfVocabularies: {
    type: Array,
    required: true,
  },
});
const emit = defineEmits(["handleSubmit", "cancel"]);

const newAnnotation = ref<AnnotationDetails>(props.newAnnotation);
const newAnnotationUri = ref<string>("");
const newAnnotationError = ref<string>("");
const showNewAnnotationDetails = ref<boolean>(false);

const findLastIndex = (str: string, char: string) => {
  let index = -1;
  for (let i = 0; i < str.length; i++) if (str[i] === char) index = i;
  return index;
};

onMounted(() => {
  initializeNewAnnotation();
});

const initializeNewAnnotation = () => {
  newAnnotation.value.showTargetProperty = "http://purl.org/dc/terms/abstract";
  const slashIndex = findLastIndex(newAnnotation.value.showTargetProperty, "/");
  const hashmarkIndex = findLastIndex(
    newAnnotation.value.showTargetProperty,
    "#"
  );
  newAnnotation.value.lastSplitChar = "/";
  if (hashmarkIndex > slashIndex) newAnnotation.value.lastSplitChar = "#";
  newAnnotation.value.showTargetRdf = props.rdfVocabularies.find(
    (rdf: any) =>
      rdf.uriDescriptors[0].namespace ===
      newAnnotation.value.showTargetProperty?.slice(
        0,
        Math.max(hashmarkIndex, slashIndex) + 1
      )
  );
};

const isURI = (str: string) => {
  try {
    new URL(str);
    return true;
  } catch (error) {
    return false;
  }
};

const uriPatternMatch = (vocabularies: any[]) => {
  let foundMatchingPattern: boolean = false;
  for (const voc of vocabularies) {
    for (const desc of voc.uriDescriptors) {
      if (desc.pattern) {
        if (new RegExp(desc.pattern).test(newAnnotationUri.value)) {
          foundMatchingPattern = true;
          break;
        }
      } else if (
        desc.namespace &&
        newAnnotationUri.value.startsWith(desc.namespace)
      ) {
        foundMatchingPattern = true;
        break;
      }
    }
    if (foundMatchingPattern) break;
  }
  return foundMatchingPattern;
};

const searchURI = async () => {
  // remove label and state if an already checked uri is changed
  if (showNewAnnotationDetails.value) {
    if (newAnnotation.value.label) delete newAnnotation.value.label;
    if (newAnnotation.value.state) delete newAnnotation.value.state;
    initializeNewAnnotation();
    showNewAnnotationDetails.value = false;
  }
  newAnnotationError.value = "";
  if (!isURI(newAnnotationUri.value)) {
    newAnnotationError.value = t(
      "validation_sidebar.new_annotation_error_messages.not_uri"
    );
    return;
  }
  if (
    props.pagedAnnotationValidation.details.find(
      (annotation: any) => annotation.value === newAnnotationUri.value
    )
  ) {
    newAnnotationError.value = t(
      "validation_sidebar.new_annotation_error_messages.uri_exists"
    );
    return;
  }

  const getPavCall = await $pavApi.getPavById(props.pavId);
  const userVocabularies: any[] = getPavCall.data.value.data.userVocabularies;
  const systemVocabularies: any[] =
    getPavCall.data.value.data.systemVocabularies;
  if (userVocabularies || systemVocabularies) {
    if (
      userVocabularies.length === 0 ||
      systemVocabularies.length === 0 ||
      (!uriPatternMatch(userVocabularies) &&
        !uriPatternMatch(systemVocabularies))
    ) {
      newAnnotationError.value = t(
        "validation_sidebar.new_annotation_error_messages.uri_not_allowed"
      );
      return;
    }
  }

  const { data, error } = await $pavApi.resolvePavUri(
    props.pavId,
    newAnnotationUri.value
  );
  if (error.value || !data.value.data.length) {
    newAnnotationError.value = t(
      "validation_sidebar.new_annotation_error_messages.error_occured_in_uri"
    );
    return;
  }

  const ann = data.value.data;
  newAnnotation.value.label = ann;
  newAnnotation.value.state = "ADD";
  showNewAnnotationDetails.value = true;
  emit("handleSubmit", newAnnotation.value);
};

const isString = (value: any) => typeof value === "string";

const getAnnotationDescription = (description: any) => {
  if (!description) return "";
  if (isString(description[0])) return description[0];
  return description.find((desc: any) => desc.language === "en").value;
};
const getAnnotationLabel = (label: any) => {
  if (isString(label[0])) return label[0];
  return label.find((lbl: any) => lbl.language === "en").value;
};

const rdfVocabularyPrefixChanged = (annotation: any) => {
  annotation.showTargetProperty = annotation.showTargetRdf.properties[0];
  const slashIndex = findLastIndex(annotation.showTargetProperty, "/");
  const hashmarkIndex = findLastIndex(annotation.showTargetProperty, "#");
  annotation.lastSplitChar = "/";
  if (hashmarkIndex > slashIndex) annotation.lastSplitChar = "#";
  emit("handleSubmit", newAnnotation.value);
};
</script>

<style scoped lang="scss">
.filter-select {
  width: fit-content !important;
}
.annotation-entry-heading {
  &.new {
    a {
      background-color: #f5f7f8;
      height: 35px;
      display: block;
      text-align: center;
      border-radius: 17.5px;
      padding: 3px 15px;
      display: inline-block;
      &:hover {
        text-decoration: none;
      }
      &.search-btn {
        background-color: #0c325c;
        color: #f5f7f8;
      }
    }
    .error-text {
      color: #b2464c;
    }
  }
}
</style>
