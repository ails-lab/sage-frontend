<template>
  <ActionSidebar
    id="offcanvasNewFilterValidation"
    ref="newFilterValidationSidebarRef"
  >
    <ActionSidebarHeader
      :title="$t('new_filter_validation_sidebar.title')"
      :description="$t('new_filter_validation_sidebar.description')"
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
          :label="$t('new_filter_validation_sidebar.name.label') + '*'"
          :description="$t('new_filter_validation_sidebar.name.description')"
        >
          <FormTextInput
            v-model="formValues.name"
            :error="formErrorAt.name"
            @input="clearFormErrorAt('name')"
          />
        </ActionFieldRow>
        <div class="field">
          <div class="preprocess-add">
            <a @click="handleAddFilter">
              <i class="fa-solid fa-plus" />{{
                $t("new_filter_validation_sidebar.add_filter_button")
              }}
            </a>
          </div>
          <NewFilter
            v-for="(_, index) of formValues.filters"
            :key="index"
            v-model="formValues.filters[index]"
            :index="index"
            :errors="formErrorAt?.filters?.[index]"
            @remove="handleRemoveFilter"
            @input="clearFormErrorAt"
          />
        </div>
      </div>
    </ActionSidebarBody>
  </ActionSidebar>
</template>

<script setup lang="ts">
import type { FilterValidationFilter } from "@/types/filter-validation.d.ts";

defineEmits(["close"]);

const { t } = useI18n();
const { toaster } = useToaster();

const { createFilterValidation, patchFilterValidation } = useAnnotationsStore();

const sidebarBodyRef = ref({ bodyRef: null });
const newFilterValidationSidebarRef = ref();

const initialFormValues: {
  name: string;
  filters: FilterValidationFilter[];
} = {
  name: "",
  filters: [],
};

const formValues = ref<{
  name: string;
  filters: FilterValidationFilter[];
}>({ ...initialFormValues });

const { selectedValidation, deselectValidation } = useSelectedValidation();
const aegId = computed(() => selectedValidation.value?.aegId);

watch(
  () => selectedValidation.value,
  () => {
    if (
      selectedValidation.value?.type === "filter" &&
      selectedValidation.value.validation
    ) {
      const validationToEdit = selectedValidation.value.validation;
      formValues.value.name = validationToEdit.name || "";
      formValues.value.filters = validationToEdit.filters;
    }
  },
  { immediate: true }
);

const formErrorAt = ref<{ [key: string]: any }>({});

const handleAddFilter = () => {
  formValues.value.filters.push({});
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
  if (index >= 0 && index < formValues.value.filters.length)
    formValues.value.filters.splice(index, 1);
};

const formValidation = () => {
  let isValid = true;
  if (!formValues.value.name) {
    formErrorAt.value.name = t("new_filter_validation_sidebar.error.required");
    isValid = false;
  }
  formErrorAt.value.filters = [];
  formValues.value?.filters.forEach((_, index) => {
    formErrorAt.value.filters.push({});
    const filterValue = formValues.value.filters[index];
    if (!filterValue.action) {
      formErrorAt.value.filters[index].type = t(
        "new_filter_validation_sidebar.error.required"
      );
      isValid = false;
    } else {
      if (!filterValue?.selectExpression) {
        formErrorAt.value.filters[index].expression = t(
          "new_filter_validation_sidebar.error.required"
        );
        isValid = false;
      }
      if (filterValue.action === "REPLACE" && !filterValue?.newValue) {
        formErrorAt.value.filters[index].newValue = t(
          "new_filter_validation_sidebar.error.required"
        );
        isValid = false;
      }
    }
  });
  return isValid;
};

const handleSubmit = async () => {
  if (!aegId.value) {
    return;
  }
  if (!formValidation()) {
    return;
  }

  const payload = {
    ...formValues.value,
  };

  if (selectedValidation.value?.validation?.id) {
    try {
      await patchFilterValidation({
        aegId: aegId.value,
        validationId: selectedValidation.value.validation.id,
        body: payload,
      });
      toaster.success(t("new_filter_validation_sidebar.success.updating"));
      closeSidebar();
    } catch (err) {
      toaster.error(t("new_filter_validation_sidebar.error.updating"));
    }
  } else {
    try {
      await createFilterValidation({
        aegId: aegId.value,
        body: payload,
      });
      toaster.success(t("new_filter_validation_sidebar.success.creating"));
      closeSidebar();
    } catch (err) {
      toaster.error(t("new_filter_validation_sidebar.error.creating"));
    }
  }
};

const clearFormErrorAt = (fieldName: string, index?: number) => {
  if (
    typeof index === "number" &&
    formErrorAt.value?.filters &&
    formErrorAt.value.filters?.[index]
  ) {
    formErrorAt.value.filters[index][fieldName] = "";
  } else {
    formErrorAt.value[fieldName] = "";
  }
};

const resetForm = () => {
  formValues.value.name = "";
  formValues.value.filters = [];
  Object.keys(formErrorAt.value).forEach(
    (key) => delete formErrorAt.value[key]
  );
};

const closeSidebar = () => {
  resetForm();
  deselectValidation();
  hideOffcanvas(newFilterValidationSidebarRef);
};
</script>
