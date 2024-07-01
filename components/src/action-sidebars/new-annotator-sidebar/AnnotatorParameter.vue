<template>
  <div v-for="(param, index) of parameters" :key="param.name">
    <FormSelectInput
      v-if="param.values?.length"
      v-model="values[index].value"
      :label="param.name"
      :options="param.values.map((value) => ({ value, label: value }))"
      :is-required="param.required"
      :error="errors?.[index]"
      @input="$emit('input', index)"
    />
    <FormTextInput
      v-else
      v-model="values[index].value"
      :label="param.name"
      :is-required="param.required"
      :error="errors?.[index]"
      @input="$emit('input', index)"
    />
  </div>
</template>

<script setup lang="ts">
import type { ServiceAnnotatorParameter } from "@/types/Annotator";
defineEmits(["update:modelValue", "input"]);
const props = defineProps<{
  errors?: string[];
  parameters: ServiceAnnotatorParameter[];
  modelValue: { [key: string]: string }[];
}>();

const values = computed(() => props.modelValue);
</script>
