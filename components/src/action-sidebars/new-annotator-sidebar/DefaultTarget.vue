<template>
  <div class="row">
    <div class="col">
      <FormSelectInput
        :label="$t('new_annotator_sidebar.default_target.target')"
        :model-value="selectedUri"
        :options="
          Object.entries(optionsDictionary).map(([uri, { uriLabel }]) => ({
            value: uri,
            label: uriLabel,
          }))
        "
        @input="handleUriDescriptor"
      />
    </div>
    <div class="col">
      <FormSelectInput
        v-if="selectedUri"
        :label="$t('new_annotator_sidebar.default_target.property')"
        :model-value="selectedProperty"
        :options="
          optionsDictionary[selectedUri].properties.map((prop) => ({
            value: prop,
            label: extractEndingFromUri(prop),
          }))
        "
        @input="handleProperty"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const { rdfVocabularies } = storeToRefs(useCurrentInstanceInfoStore());

const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  modelValue: {
    type: String,
    default: undefined,
  },
});

watch(
  () => props.modelValue,
  (value) => {
    if (!value) {
      selectedUri.value = "";
      selectedProperty.value = "";
      return;
    }

    const prefix = extractPrefixFromUri(value);

    selectedUri.value = prefix;
    selectedProperty.value = props.modelValue;
  }
);

const selectedUri = ref<string>();
const selectedProperty = ref<string>();

const optionsDictionary = computed(() => {
  const options: {
    [key: string]: { uriLabel: string; properties: string[] };
  } = {};
  rdfVocabularies.value.forEach((voc) => {
    const uri = voc.uriDescriptors?.[0];
    options[uri.namespace] = {
      uriLabel: uri.prefix,
      properties: voc.properties,
    };
  });
  return options;
});

const handleUriDescriptor = (event: Event) => {
  selectedUri.value = (event.target as HTMLInputElement).value;
  selectedProperty.value = "";
};

const handleProperty = (event: Event) => {
  emit("update:modelValue", (event.target as HTMLInputElement).value);
};
</script>
