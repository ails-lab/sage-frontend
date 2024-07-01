<template>
  <ActionSidebar id="offcanvasNewAnnotator" ref="newAnnotatorSidebarRef">
    <ActionSidebarHeader
      :title="
        selectedAnnotator
          ? $t('new_annotator_sidebar.title.edit')
          : $t('new_annotator_sidebar.title.new')
      "
      :description="$t('new_annotator_sidebar.description')"
      :close-label="$t('cancel')"
      @close="closeSidebar()"
    >
      <template #action>
        <ActionSidebarHeaderAction
          href="#"
          :aria-label="$t('save')"
          @click="handleSubmit"
        >
          {{ $t("save") }}
        </ActionSidebarHeaderAction>
      </template>
    </ActionSidebarHeader>
    <ActionSidebarBody ref="sidebarBodyRef">
      <div class="sage-form">
        <ActionFieldRow
          :label="$t('new_annotator_sidebar.name.label') + '*'"
          :description="$t('new_annotator_sidebar.name.description')"
        >
          <FormTextInput
            v-model="formValues.name"
            :error="formErrorAt.name"
            @input="clearFormErrorAt('name')"
          />
        </ActionFieldRow>
        <ActionFieldRow
          :label="$t('new_annotator_sidebar.annotator.label') + '*'"
          :description="$t('new_annotator_sidebar.annotator.description')"
        >
          <FormSelectInput
            v-model="formValues.annotator"
            :options="
              servicesAnnotators?.map((annotator) => ({
                value: annotator.identifier,
                label: annotator.title,
              })) || []
            "
            :error="formErrorAt.annotator"
            @input="clearFormErrorAt('annotator')"
          />
        </ActionFieldRow>
        <ActionFieldRow
          v-if="isThesaurus"
          :label="$t('new_annotator_sidebar.thesaurus.label') + '*'"
          :description="$t('new_annotator_sidebar.thesaurus.description')"
        >
          <FormSelectInput
            v-model="formValues.thesaurus"
            :options="thesaurusOptions"
            :error="formErrorAt.thesaurus"
            @input="clearFormErrorAt('thesaurus')"
          />
        </ActionFieldRow>
        <ActionFieldRow
          v-if="selectedServiceAnnotator?.parameters?.length"
          :label="$t('new_annotator_sidebar.annotator_parameters.label')"
          :description="
            $t('new_annotator_sidebar.annotator_parameters.description')
          "
        >
          <AnnotatorParameter
            v-model="formValues.parameters"
            :parameters="selectedServiceAnnotator.parameters"
            :errors="formErrorAt.parameters"
            @input="(index) => clearFormErrorAt('parameters', index)"
          />
        </ActionFieldRow>
        <ActionFieldRow
          v-if="selectedServiceAnnotator?.variants?.length"
          :label="$t('new_annotator_sidebar.variant.label') + '*'"
          :description="$t('new_annotator_sidebar.variant.description')"
        >
          <FormSelectInput
            v-model="formValues.variant"
            :options="
              selectedServiceAnnotator.variants.map((variant) => ({
                label: variant.name,
                value: variant.name,
              }))
            "
            :error="formErrorAt.variant"
            @input="clearFormErrorAt('variant')"
          />
        </ActionFieldRow>
        <ActionFieldRow
          :label="$t('new_annotator_sidebar.default_target.label')"
          :description="$t('new_annotator_sidebar.default_target.description')"
        >
          <DefaultTarget v-model="formValues.defaultTarget" />
        </ActionFieldRow>

        <div class="field">
          <div class="preprocess-add">
            <a @click="handleAddFilter">
              <i class="fa-solid fa-plus" />{{
                $t("new_annotator_sidebar.preprocess.label")
              }}
            </a>
          </div>
          <AnnotatorFunction
            v-for="(_, index) of formValues.preprocess"
            :key="index"
            v-model="formValues.preprocess[index]"
            :index="index"
            :functions="functions"
            :operations="operations"
            @remove="handleRemoveFilter"
          />
        </div>
      </div>
      <div class="sage-form-info">
        <div class="notify">{{ $t("mandatory_field_explanation") }}</div>
      </div>
    </ActionSidebarBody>
  </ActionSidebar>
</template>

<script setup lang="ts">
import { useThesaurusProperties } from "./useThesaurusProperties";
import type { PreProcess } from "@/types/Function";

const { t } = useI18n();
const { toaster } = useToaster();

const { selectedDataset } = storeToRefs(useSidebarDataStore());
const { publishedVocabularies } = storeToRefs(useUserVocabulariesStore());
const {
  services,
  functions: instanceFunctions,
  operations: instanceOperations,
} = storeToRefs(useCurrentInstanceInfoStore());
const { createAnnotator, updateAnnotator } = useAnnotatorsStore();
const newAnnotatorSidebarRef = ref();

const servicesAnnotators = computed(() => services.value.annotators);
const functions = computed(() => instanceFunctions.value);
const operations = computed(() => instanceOperations.value);

const props = defineProps<{
  onClass: string;
  onProperty: string;
}>();

const initialFormValues:
  | {
      name?: string;
      annotator?: string;
      defaultTarget?: string;
      variant?: string;
      thesaurus?: string;
      parameters: { value: string; name: string }[];
      preprocess: PreProcess[];
    }
  | { [key: string]: any } = {
  parameters: [],
  preprocess: [],
};
const formValues = ref({ ...initialFormValues });
const formErrorAt = ref<{
  [key: string]: any;
}>({});

const { thesaurusProperties, emptyThesaurusProperties } =
  useThesaurusProperties(formValues);
const { selectedAnnotator, deselectAnnotator } = useSelectedAnnotator();

watch(
  () => selectedAnnotator.value,
  (newValue) => {
    // Prepopulate formValues
    if (newValue) {
      formValues.value.name = newValue.name;
      formValues.value.annotator = newValue.annotator;
      formValues.value.defaultTarget = newValue.defaultTarget?.uri;
      formValues.value.variant = newValue.variant;
      formValues.value.thesaurus = newValue.thesaurus;
      formValues.value.preprocess = newValue.preprocess;
    }
  },
  { immediate: true }
);

const selectedServiceAnnotator = computed(() => {
  const selected = servicesAnnotators.value?.find(
    (annotator) => annotator.identifier === formValues.value.annotator
  );
  if (!selected) {
    return;
  }
  if (isThesaurus.value && !thesaurusProperties.value) {
    return;
  }
  selected.parameters = selected?.parameters?.map((param) => {
    const thesaurusProperty = extractThesaurusProperty(param);
    if (
      thesaurusProperty &&
      thesaurusProperties.value &&
      thesaurusProperty in thesaurusProperties.value
    ) {
      const newParamValues = thesaurusProperties.value[thesaurusProperty];
      return {
        ...param,
        values: newParamValues,
      };
    } else {
      return param;
    }
  });
  return selected;
});

// Populate the parameters values based on the selected service annotator
// If we are editing an annotator, use that instead
watchEffect(() => {
  const shouldCheckSelectedAnnotator =
    selectedAnnotator.value?.annotator &&
    selectedAnnotator.value?.annotator === formValues.value.annotator;

  formValues.value.parameters = shouldCheckSelectedAnnotator
    ? selectedAnnotator.value?.parameters.map((param) => ({
        name: param.name,
        value: param.value || "",
      })) || []
    : selectedServiceAnnotator.value?.parameters.map((param) => ({
        name: param.name,
        value: param.defaultValue || "",
      })) || [];
  formErrorAt.value.parameters = [];
});

const thesaurusOptions = computed(() =>
  publishedVocabularies.value.map((userVoc) => ({
    value: userVoc.id,
    label: userVoc.identifier,
  }))
);

const isThesaurus = computed(() =>
  formValues.value?.annotator?.startsWith("inthesaurus")
);

const sidebarBodyRef = ref({ bodyRef: null });
const handleAddFilter = () => {
  formValues.value.preprocess.push({});
  setTimeout(() => {
    if (sidebarBodyRef.value?.bodyRef) {
      const containerDiv = sidebarBodyRef.value.bodyRef as HTMLElement;
      containerDiv.scrollTo({
        top: containerDiv.scrollHeight,
        behavior: "smooth",
      });
    }
  }, 200);
};

const handleRemoveFilter = (index: number) => {
  if (index >= 0 && index < formValues.value.preprocess.length)
    formValues.value.preprocess.splice(index, 1);
};

const handleSubmit = async () => {
  if (!formValidation()) {
    return;
  }

  const payload = {
    ...formValues.value,
    onPath: [
      {
        type: "CLASS",
        uri: props.onClass,
      },
      {
        type: "PROPERTY",
        uri: props.onProperty,
      },
    ],
  };

  if (selectedAnnotator.value?.id) {
    try {
      await updateAnnotator(selectedAnnotator.value.id, payload);
      toaster.success(t("new_annotator_sidebar.success.updating"));
      closeSidebar();
    } catch (error: any) {
      toaster.error(error);
    }
  } else {
    try {
      await createAnnotator(selectedDataset.value.id, payload);
      toaster.success(t("new_annotator_sidebar.success.creating"));
      closeSidebar();
    } catch (error: any) {
      toaster.error(error);
    }
  }
};

const formValidation = () => {
  let isValid = true;
  if (!formValues.value.name) {
    formErrorAt.value.name = t("new_annotator_sidebar.error.required");
    isValid = false;
  }
  if (!formValues.value.annotator) {
    formErrorAt.value.annotator = t("new_annotator_sidebar.error.required");
    isValid = false;
  }
  if (
    !formValues.value.variant ||
    !selectedServiceAnnotator.value?.variants?.find(
      (v) => v.name === formValues.value.variant
    )
  ) {
    formErrorAt.value.variant = t("new_annotator_sidebar.error.required");
    isValid = false;
  }
  if (isThesaurus.value && !formValues.value.thesaurus) {
    formErrorAt.value.thesaurus = t("new_annotator_sidebar.error.required");
    isValid = false;
  }

  formErrorAt.value.parameters = [];
  selectedServiceAnnotator.value?.parameters.forEach((param, index) => {
    formErrorAt.value.parameters.push(undefined);
    if (param.required) {
      if (!formValues.value.parameters[index].value?.length) {
        formErrorAt.value.parameters[index] = t(
          "new_annotator_sidebar.error.required"
        );
        isValid = false;
      }
    }
  });
  return isValid;
};

const clearFormErrorAt = (fieldName: string, index?: number) => {
  const fields = fieldName.split(".");
  if (fields.length === 1) {
    if (typeof index === "number") {
      formErrorAt.value[fields[0]][index] = "";
    } else {
      formErrorAt.value[fields[0]] = "";
    }
  } else {
    formErrorAt.value[fields[0]][fields[1]] = "";
  }
};

const resetForm = () => {
  Object.keys(formValues.value).forEach((field) => {
    const fieldName = field as keyof typeof formValues.value;
    const initialValue = initialFormValues[
      fieldName
    ] as (typeof formValues.value)[keyof typeof formValues.value];

    formValues.value[fieldName] = initialValue;
  });

  emptyThesaurusProperties();
};

const closeSidebar = () => {
  Object.keys(formErrorAt.value).forEach(
    (key) => delete formErrorAt.value[key]
  );
  resetForm();

  deselectAnnotator();
  hideOffcanvas(newAnnotatorSidebarRef);
};
</script>
