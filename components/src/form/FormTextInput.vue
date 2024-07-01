<template>
  <div>
    <div v-if="finalLabel" class="form-sublabel">{{ finalLabel }}</div>
    <div class="form-field-row">
      <div :class="$slots.action && 'form-field-box'">
        <input
          v-if="!rows || rows === 1"
          class="form-control"
          type="text"
          :name="name"
          :value="modelValue"
          :aria-label="ariaLabel"
          @input="handleInput"
        />
        <textarea
          v-if="rows && rows > 1"
          class="form-control"
          :name="name"
          :value="modelValue"
          :aria-label="ariaLabel"
          :rows="rows"
          @input="handleInput"
        />
        <p :class="{ 'no-error-height': !error }" class="form-error">
          {{ error }}
        </p>
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
import type { TextInputProps } from "@/types/form.d.ts";
const emits = defineEmits(["update:modelValue", "input"]);
const props = defineProps<TextInputProps>();

const finalLabel = computed(() =>
  props.label ? `${props.label}${props.isRequired ? "*" : ""}` : undefined
);

const handleInput = (event: Event) => {
  emits("update:modelValue", (event.target as HTMLTextAreaElement).value);
  emits("input", event);
};
</script>
<style lang="scss">
.no-error-height {
  height: 28px;
}
</style>
