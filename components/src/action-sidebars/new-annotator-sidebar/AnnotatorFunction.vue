<template>
  <div class="preprocess-section">
    <div class="row">
      <div class="col">
        <FormSelectInput
          :model-value="values.function"
          :label="$t('new_annotator_sidebar.function.label')"
          :group-options="groupOptions"
          :notify-text="$t('new_annotator_sidebar.function.notify_text')"
          @input="handleFunctionSelect"
        />
      </div>
      <div class="col">
        <div v-if="values.parameters">
          <FormTextInput
            v-for="(param, indexParam) of values.parameters"
            :key="param.name"
            v-model="values.parameters[indexParam].value"
            :label="param.name"
          />
        </div>
        <FormSelectInput
          v-if="isOperation"
          :label="$t('new_annotator_sidebar.modifier.label')"
          :options="modifierOptions"
          :model-value="values.modifier"
          @input="handleModifier"
        />
      </div>
      <div class="col col-1 form-field-action no-padding">
        <a class="add" @click="$emit('remove', index)"
          ><i class="fa-regular fa-trash-can"> </i
        ></a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Function, Operation, PreProcess } from "@/types/Function";

const LOGICAL_NOT_MODIFIER = "http://islab.ntua.gr/ns/d2rml-op#logicalNot";

const { t } = useI18n();
const emit = defineEmits(["update:modelValue", "remove"]);
const props = defineProps<{
  index: number;
  functions: Function[];
  operations: Operation[];
  modelValue: PreProcess;
}>();

const values = computed(() => props.modelValue);

const groupOptions = computed(() => [
  {
    label: "functions",
    options: props.functions.map((fn) => ({
      label: fn.uri,
      value: fn.uri,
    })),
  },
  {
    label: "operations",
    options: props.operations.map((op) => ({
      label: op.uri,
      value: op.uri,
    })),
  },
]);

const modifierOptions = [
  { label: t("new_annotator_sidebar.modifier.none"), value: "" },
  {
    label: t("new_annotator_sidebar.modifier.logical_not"),
    value: LOGICAL_NOT_MODIFIER,
  },
];

const isOperation = ref(false);

const handleFunctionSelect = (event: Event) => {
  let selectedFunction;
  isOperation.value = false;
  selectedFunction = props.functions.find(
    (fn) => fn.uri === (event.target as HTMLInputElement).value
  );
  if (!selectedFunction) {
    isOperation.value = true;
    selectedFunction = props.operations.find(
      (op) => op.uri === (event.target as HTMLInputElement).value
    );
  }
  if (selectedFunction) {
    emit("update:modelValue", {
      function: selectedFunction.uri,
      parameters: selectedFunction.parameters
        .filter((param) => param !== "input")
        .map((param) => ({
          name: param,
          value: "",
        })),
    });
  }
};

const handleModifier = (event: Event) => {
  const modifier = (event.target as HTMLInputElement).value;

  if (modifier.length) {
    emit("update:modelValue", {
      ...props.modelValue,
      modifier,
    });
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { modifier: prevModifier, ...restValues } = props.modelValue;
    emit("update:modelValue", restValues);
  }
};
</script>

<style scoped>
.no-padding {
  padding: 0px;
}
</style>
