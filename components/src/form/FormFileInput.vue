<template>
  <div>
    <div v-if="finalLabel" class="form-sublabel">{{ finalLabel }}</div>
    <div class="form-field-row">
      <div :class="$slots.action && 'form-field-box'">
        <input
          ref="fileInput"
          class="form-control"
          type="file"
          :name="name"
          :value="modelValue"
          :aria-label="ariaLabel"
          :accept="accept"
          @change="handleInput"
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
import type { FileInputProps } from "~/types/form.d.ts";

const emits = defineEmits(["update:modelValue", "input"]);

const props = defineProps<FileInputProps>();

const finalLabel = computed(() =>
  props.label ? `${props.label}${props.isRequired ? "*" : ""}` : undefined
);

const handleInput = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  emits("update:modelValue", file);
  emits("input", event);
};
</script>
