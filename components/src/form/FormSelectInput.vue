<template>
  <div>
    <div v-if="finalLabel" class="form-sublabel">{{ finalLabel }}</div>
    <div class="form-field-row">
      <div :class="$slots.action && 'form-field-box'">
        <select
          v-if="groupOptions"
          :placeholder="placeholder"
          class="form-select"
          :name="name"
          :aria-label="ariaLabel"
          :value="modelValue"
          @input="handleInput"
        >
          <option v-if="placeholder" selected disabled value="">
            {{ placeholder }}
          </option>
          <optgroup
            v-for="group of groupOptions"
            :key="group.label"
            :label="group.label"
          >
            <option
              v-for="opt of group.options"
              :key="opt.value"
              :value="opt.value"
              :disabled="opt.disabled"
            >
              {{ opt.label }}
            </option>
          </optgroup>
        </select>
        <select
          v-else
          :placeholder="placeholder"
          class="form-select"
          :name="name"
          :aria-label="ariaLabel"
          :value="modelValue"
          @input="handleInput"
        >
          <option v-if="placeholder" selected disabled value="">
            {{ placeholder }}
          </option>
          <option
            v-for="opt of options.filter((o) => !o.hidden)"
            :key="opt.value"
            :value="opt.value"
            :disabled="opt.disabled"
          >
            {{ opt.label }}
          </option>
        </select>
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
import type { SelectInputProps } from "@/types/form.d.ts";

const emits = defineEmits(["update:modelValue", "input"]);

const props = withDefaults(defineProps<SelectInputProps>(), {
  placeholder: "Please Select",
});

const finalLabel = computed(() =>
  props.label ? `${props.label}${props.isRequired ? "*" : ""}` : undefined
);

const handleInput = (event: Event) => {
  emits("update:modelValue", (event.target as HTMLTextAreaElement).value);
  emits("input", event);
};
</script>
