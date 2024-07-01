<template>
  <div v-for="dim of dimensions" :key="dim.name">
    <FormSelectInput
      v-model="values[dim.code]"
      :label="dim.name"
      :options="options"
    />
  </div>
</template>

<script setup lang="ts">
import type { ValidationModeDimension } from "@/types/validation-mode.d.ts";

defineEmits(["update:modelValue"]);
const props = defineProps<{
  dimensions?: ValidationModeDimension[];
  modelValue: { [key: string]: "ASC" | "DESC" };
}>();

const options = [
  { value: "ASC", label: "Ascending" },
  { value: "DESC", label: "Descending" },
];

const values = computed(() => props.modelValue);
</script>
