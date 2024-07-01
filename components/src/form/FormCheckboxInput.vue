<template>
  <div :class="`checkbox-input ${classname || ''}`">
    <div v-if="finalLabel" class="form-sublabel">{{ finalLabel }}</div>
    <div>
      <div :class="$slots.action && 'form-field-box'">
        <input
          type="checkbox"
          :name="name"
          :checked="modelValue"
          :aria-label="ariaLabel"
          @input="handleInput"
        />
        <p v-if="error" class="form-error">{{ error }}</p>
        <div v-if="notifyText" class="form-notify">
          {{ notifyText }}
        </div>
      </div>
      <div v-if="$slots.action" class="form-field-action">
        <slot name="action" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CheckboxInputProps } from "~/types/form.d.ts";

const emits = defineEmits(["update:modelValue", "input"]);
const props = defineProps<CheckboxInputProps>();

const finalLabel = computed(() =>
  props.label ? `${props.label}${props.isRequired ? "*" : ""}` : undefined
);

const handleInput = (event: Event) => {
  emits("update:modelValue", (event.target as HTMLInputElement).checked);
  emits("input", event);
};
</script>

<style scoped lang="scss">
.checkbox-input {
  display: flex;
  flex-direction: row-reverse;
  justify-content: flex-end;
  gap: 12px;
  align-items: center;

  .form-sublabel {
    text-transform: none;
  }
}
</style>
