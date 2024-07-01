<template>
  <div class="preprocess-section">
    <div class="row">
      <div class="col">
        <FormSelectInput
          :model-value="values.action"
          :label="$t('new_filter_validation_sidebar.filter.type.label')"
          :error="errors?.type"
          :options="[
            {
              label: $t('new_filter_validation_sidebar.filter.type.replace'),
              value: 'REPLACE',
            },
            {
              label: $t('new_filter_validation_sidebar.filter.type.delete'),
              value: 'DELETE',
            },
          ]"
          @input="handleTypeSelect"
        />
      </div>
      <div class="col">
        <FormTextInput
          v-if="values.action === 'REPLACE' || values.action === 'DELETE'"
          v-model="values.selectExpression"
          :rows="3"
          :error="errors?.expression"
          :label="$t('new_filter_validation_sidebar.filter.expression')"
          @input="onInput('expression')"
        />
        <FormTextInput
          v-if="values.action === 'REPLACE'"
          v-model="values.newValue"
          :error="errors?.newValue"
          :label="$t('new_filter_validation_sidebar.filter.new_value')"
          @input="onInput('newValue')"
        />
      </div>
      <div class="col col-1 form-field-action custom-width no-padding">
        <a class="add" @click="$emit('remove', index)"
          ><i class="fa-regular fa-trash-can"> </i
        ></a>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { FilterValidationFilter } from "@/types/filter-validation.d.ts";
const emit = defineEmits(["update:modelValue", "remove", "input"]);

const props = defineProps<{
  index: number;
  errors?: { [key: string]: string };
  modelValue: FilterValidationFilter;
}>();

const values = computed(() => props.modelValue);

const handleTypeSelect = (e: Event) => {
  const value = (e.target as HTMLInputElement).value;
  emit("update:modelValue", { ...values.value, action: value });
  onInput("type");
};

const onInput = (fieldName: string) => {
  emit("input", fieldName, props.index);
};
</script>

<style lang="scss" scoped>
.form-field-action.no-padding.custom-width {
  width: calc(100% / 12);
}
</style>
