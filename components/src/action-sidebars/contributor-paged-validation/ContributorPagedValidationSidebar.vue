<template>
  <ActionSidebar
    id="offcanvasContributorPagedValidation"
    ref="contributorValidationSidebarRef"
  >
    <ActionSidebarHeader
      :title="$t('contributor_paged_validation_sidebar.title')"
      :description="$t('contributor_paged_validation_sidebar.description')"
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
    <ActionSidebarBody>
      <div class="sage-form">
        <ActionFieldRow
          :label="$t('contributor_paged_validation_sidebar.name.label') + '*'"
          :description="
            $t('contributor_paged_validation_sidebar.name.description')
          "
        >
          <FormTextInput
            v-model="formValues.name"
            :error="formErrorAt.name"
            @input="clearFormErrorAt('name')"
          />
        </ActionFieldRow>
        <ActionFieldRow
          :label="
            $t(
              'contributor_paged_validation_sidebar.item_sorting_order.label'
            ) + '*'
          "
          :description="
            $t(
              'contributor_paged_validation_sidebar.item_sorting_order.description'
            )
          "
        >
          <FormSelectInput
            v-model="formValues.itemSortingStrategy"
            :label="
              $t(
                'contributor_paged_validation_sidebar.item_sorting_order.strategy'
              )
            "
            :error="formErrorAt.itemSortingStrategy"
            :options="
              validationModes.map((mode) => ({
                value: mode.code,
                label: mode.label,
              }))
            "
            @input="clearFormErrorAt('itemSortingStrategy')"
          />
          <ItemSortingOrder
            v-if="formValues.itemSortingStrategy"
            v-model="formValues.itemSortingOrder"
            :dimensions="selectedStrategy?.dimensions"
          />
        </ActionFieldRow>
        <ActionFieldRow
          :label="$t('contributor_paged_validation_sidebar.vocabularies.title')"
          :description="
            $t('contributor_paged_validation_sidebar.vocabularies.description')
          "
        >
          <div
            v-for="(voc, index) in formValues.vocabularies"
            :key="index"
            class="vocabulary-input-wrapper"
          >
            <div class="vocabulary-select-input">
              <FormSelectInput
                v-model="formValues.vocabularies[index]"
                :group-options="vocabulariesGroupOptions"
              />
            </div>
            <div class="form-field-action no-padding vocabulary-remove-button">
              <a class="add" @click="handleRemoveVocabulary(index)"
                ><i class="fa-regular fa-trash-can"> </i
              ></a>
            </div>
          </div>
          <div class="preprocess-add">
            <a @click="handleAddVocabulary"
              ><i class="fa-solid fa-plus" />{{
                $t("contributor_paged_validation_sidebar.vocabularies.add")
              }}</a
            >
          </div>
        </ActionFieldRow>
      </div>
    </ActionSidebarBody>
  </ActionSidebar>
</template>

<script setup lang="ts">
import {
  modeToFormValues,
  formValuesToMode,
  modeToStrategy,
} from "./translateMode";
import type { UserVocabulary } from "~/types/Vocabulary";

const { createPagedAnnotationValidation, patchPagedAnnotationValidation } =
  useAnnotationsStore();
const { validationModes, allVocabularies } = storeToRefs(
  useCurrentInstanceInfoStore()
);
const { userVocabularies } = storeToRefs(useUserVocabulariesStore());

defineEmits(["close"]);

const { t } = useI18n();
const { toaster } = useToaster();

const contributorValidationSidebarRef = ref();

const { selectedValidation, deselectValidation } = useSelectedValidation();
const aegId = computed(() => selectedValidation.value?.aegId);
const selectedPav = computed(() => selectedValidation.value?.validation);

const fetchedVocabulariesGroup = ref<{ label: string; options: any[] }[]>([]);

const formValues = ref<{
  name: string;
  vocabularies: string[];
  itemSortingStrategy?: string;
  itemSortingOrder: { [key: string]: "ASC" | "DESC" };
}>({ name: "", itemSortingOrder: {}, vocabularies: [] });
const formErrorAt = ref<{ [key: string]: any }>({});

watch(
  () => selectedValidation.value,
  (value) => {
    if (value?.type === "paged" && value?.validation) {
      const validation = value.validation;
      // TODO: Populate correctly the formValues, only needed fields
      formValues.value.name = validation.name;
      formValues.value.vocabularies = [
        ...(validation.systemVocabularies?.map((voc) => voc.id) || []),
        ...(validation.userVocabularies?.map((voc) => voc.id) || []),
      ];
      formValues.value.itemSortingOrder = modeToFormValues(validation.mode);
      formValues.value.itemSortingStrategy = modeToStrategy(validation.mode);
    }
  },
  { immediate: true }
);

const selectedStrategy = computed(() =>
  validationModes.value.find(
    (mode) => mode.code === formValues.value.itemSortingStrategy
  )
);

/** Update the itemSortingOrder based on newly selected strategy */
watch(
  () => selectedStrategy.value,
  (value) => {
    if (value) {
      // First check if it is prepopulated
      // If yes, check if it is changed since initialization, if not, return
      let preselectedMode;
      if (selectedValidation.value?.type === "paged") {
        preselectedMode = selectedValidation.value?.validation?.mode;
      }

      if (preselectedMode) {
        if (modeToStrategy(preselectedMode) === value?.code) return;
      }
      formValues.value.itemSortingOrder = value.dimensions.reduce(
        (acc: any, dim: any) => ({ ...acc, [dim.code]: "DESC" }),
        {}
      );
    }
  }
);

const vocabulariesGroupOptions = computed(() =>
  fetchedVocabulariesGroup.value.map((group) => ({
    label: group.label,
    options: group.options.map((voc) => ({
      ...voc,
      disabled: formValues.value.vocabularies.includes(voc.value),
    })),
  }))
);

const populateVocabularies = () => {
  fetchedVocabulariesGroup.value = [
    {
      label: t("contributor_paged_validation_sidebar.vocabularies.system"),
      options: [],
    },
    {
      label: t("contributor_paged_validation_sidebar.vocabularies.user"),
      options: [],
    },
  ];
  fetchedVocabulariesGroup.value[0].options = allVocabularies.value.map(
    (voc: any) => ({
      value: voc.id,
      label: voc.name,
    })
  );
  fetchedVocabulariesGroup.value[1].options = userVocabularies.value.map(
    (voc: UserVocabulary) => ({
      value: voc.id,
      label: voc.name,
    })
  );
};

onMounted(() => {
  populateVocabularies();
});

const handleAddVocabulary = () => {
  formValues.value.vocabularies.push("");
};

const handleRemoveVocabulary = (index: number) => {
  if (index >= 0 && index < formValues.value.vocabularies.length)
    formValues.value.vocabularies.splice(index, 1);
};

const formValidation = () => {
  let isValid = true;
  if (!formValues.value.name) {
    formErrorAt.value.name = t(
      "contributor_paged_validation_sidebar.error.required_field"
    );
    isValid = false;
  }
  if (!formValues.value.itemSortingStrategy) {
    formErrorAt.value.itemSortingStrategy = t(
      "contributor_paged_validation_sidebar.error.required_field"
    );
    isValid = false;
  }
  return isValid;
};

const handleSubmit = async () => {
  if (!formValidation()) {
    return;
  }

  const mode = formValuesToMode(formValues.value.itemSortingOrder);

  const payload = {
    name: formValues.value.name,
    mode,
    systemVocabularies: formValues.value.vocabularies.filter((voc) =>
      vocabulariesGroupOptions.value[0].options.find((o) => o.value === voc)
    ),
    userVocabularies: formValues.value.vocabularies.filter((voc) =>
      vocabulariesGroupOptions.value[1].options.find((o) => o.value === voc)
    ),
  };

  if (aegId.value && selectedPav.value?.id) {
    try {
      await patchPagedAnnotationValidation({
        aegId: aegId.value,
        pavId: selectedPav.value?.id,
        body: payload,
      });
      toaster.success(
        t("contributor_paged_validation_sidebar.success.updating")
      );
      closeSidebar();
    } catch (err) {
      toaster.error(t("contributor_paged_validation_sidebar.error.updating"));
    }
  } else if (aegId.value) {
    try {
      await createPagedAnnotationValidation({
        aegId: aegId.value,
        body: payload,
      });
      toaster.success(
        t("contributor_paged_validation_sidebar.success.creating")
      );
      closeSidebar();
    } catch (err) {
      toaster.error(t("contributor_paged_validation_sidebar.error.creating"));
    }
  }
};

const clearFormErrorAt = (fieldName: string) => {
  formErrorAt.value[fieldName] = "";
};

const resetForm = () => {
  formValues.value.name = "";
  formValues.value.itemSortingStrategy = "";
  formValues.value.itemSortingOrder = {};
  formValues.value.vocabularies = [];
  Object.keys(formErrorAt.value).forEach(
    (key) => delete formErrorAt.value[key]
  );
};

const closeSidebar = () => {
  resetForm();
  deselectValidation();
  hideOffcanvas(contributorValidationSidebarRef);
};
</script>

<style scoped lang="scss">
.vocabulary-input-wrapper {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.vocabulary-select-input {
  flex-grow: 1;
}

.vocabulary-remove-button {
  flex-shrink: 0;
}
</style>
