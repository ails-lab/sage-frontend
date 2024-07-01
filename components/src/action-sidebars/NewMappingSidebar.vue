<template>
  <ActionSidebar id="offcanvasAddMapping" ref="addMappingCanvas">
    <ActionSidebarHeader
      :title="
        $t(
          mapping
            ? 'add_mapping_sidebar.title.edit'
            : 'add_mapping_sidebar.title.new'
        )
      "
      :description="$t('add_mapping_sidebar.description')"
      :close-label="$t('cancel')"
      @close="closeSidebar"
    >
      <template #action>
        <ActionSidebarHeaderAction
          :aria-label="$t('save')"
          @click="saveMapping"
        >
          {{ $t("save") }}
        </ActionSidebarHeaderAction>
      </template>
    </ActionSidebarHeader>
    <ActionSidebarBody>
      <div class="sage-form">
        <div class="field row">
          <label class="form-label col" for="mappingType">
            <div class="lbl">
              {{ $t("add_mapping_sidebar.mapping_type") }} *
            </div>
            <div class="desc">
              {{ $t("add_mapping_sidebar.mapping_type_description") }}
            </div>
          </label>
          <div class="form-field col">
            <select
              v-model="formData.type"
              class="form-select"
              aria-label="mappingType"
            >
              <option value="CONTENT" :disabled="targetIsCatalog">
                {{ $t("catalog_page.data_mapping") }}
              </option>
              <option
                v-if="!useRuntimeConfig().public.ai4cultureDeployment"
                value="HEADER"
              >
                {{ $t("catalog_page.metadata_mapping") }}
              </option>
            </select>
          </div>
        </div>
        <div class="field row">
          <label class="form-label col" for="mappingName">
            <div class="lbl">
              {{ $t("add_mapping_sidebar.mapping_name") }} *
            </div>
            <div class="desc">
              {{ $t("add_mapping_sidebar.mapping_name_description") }}
            </div>
          </label>
          <div class="form-field col">
            <input
              v-model="formData.name"
              class="form-control"
              type="text"
              aria-label="mappingName"
              @input="clearFormErrorAt('name')"
            />
            <span v-if="formErrorAt.name.length" class="form-error">
              {{ formErrorAt.name }}
            </span>
          </div>
        </div>
        <ActionFieldRow
          :label="$t('add_mapping_sidebar.identifier')"
          :description="$t('add_mapping_sidebar.identifier_description')"
        >
          <FormTextInput
            v-model="formData.identifier"
            :error="identifierError?.message"
            @input="handleIdentifierChange"
          />
        </ActionFieldRow>
        <div class="field row">
          <label class="form-label col" for="mappingDescription">
            <div class="lbl">
              {{ $t("add_mapping_sidebar.mapping_description") }}
            </div>
            <div class="desc">
              {{ $t("add_mapping_sidebar.mapping_description_description") }}
            </div>
          </label>
          <div class="form-field col">
            <input
              v-model="formData.description"
              class="form-control"
              type="text"
              aria-label="mappingDescription"
            />
          </div>
        </div>
        <div class="field row separating-row">
          <label class="form-label col" for="mappingSource">
            <div class="lbl">
              {{ $t("add_mapping_sidebar.mapping_source") }} *
            </div>
            <div class="desc">
              {{ $t("add_mapping_sidebar.mapping_source_description") }}
            </div>
          </label>
          <div class="form-field col">
            <select
              v-model="formData.source"
              class="form-select"
              aria-label="mappingSource"
              @change="selectMappingSource()"
            >
              <option value="empty">
                {{ $t("add_mapping_sidebar.empty_mapping") }}
              </option>
              <option value="d2rml">
                {{ $t("add_mapping_sidebar.d2rml_document") }}
              </option>
              <option value="d2rml_schema">
                {{ $t("add_mapping_sidebar.d2rml_schema") }}
              </option>
              <option value="sample">
                {{ $t("add_mapping_sidebar.sample_mapping") }}
              </option>
            </select>
          </div>
        </div>
        <div v-if="formData.source === 'd2rml'" class="field row">
          <label class="form-label col" for="mappingFile">
            <div class="lbl">
              {{ $t("add_mapping_sidebar.d2rml_document") }}
            </div>
            <div class="desc">
              {{ $t("add_mapping_sidebar.d2rml_document_description") }}
            </div>
          </label>
          <div class="form-field col">
            <input
              ref="fileInput"
              class="form-control"
              type="file"
              aria-label="mappingFile"
              accept=".ttl, .trig"
              @change="validateD2rmlFile($event)"
            />
            <span v-if="formErrorAt.d2rmlFile.length" class="form-error">
              {{ formErrorAt.d2rmlFile }}
            </span>
          </div>
        </div>
        <div v-if="formData.source === 'd2rml_schema'" class="field row">
          <label class="form-label col" for="mappingFile">
            <div class="lbl">
              {{ $t("add_mapping_sidebar.d2rml_schema") }}
            </div>
          </label>
          <div class="form-field col">
            <select
              v-model="formData.d2rmlId"
              class="form-select"
              aria-label="mappingD2rmlId"
            >
              <option value="" disabled>
                {{ $t("add_mapping_sidebar.select_d2rml_scheme") }}
              </option>
              <option
                v-for="d2rml of d2rmlSchemata"
                :key="d2rml.id"
                :value="d2rml.id"
              >
                {{ d2rml.name }}
              </option>
            </select>
            <FormCheckboxInput
              v-if="formData.d2rmlId"
              v-model="formData.d2rmlIdBound"
              name="active"
              :label="$t('add_mapping_sidebar.bind_to_schema')"
            />
          </div>
        </div>
        <div v-if="formData.source === 'sample'" class="field row">
          <label class="form-label col" for="mappingSample">
            <div class="lbl">
              {{ $t("add_mapping_sidebar.sample_mapping") }}
            </div>
            <div class="desc">
              {{ $t("add_mapping_sidebar.sample_mapping_description") }}
            </div>
          </label>
          <div class="form-field col">
            <select
              v-model="formData.sampleMappingId"
              class="form-select"
              aria-label="mappingSample"
              @change="
                selectSampleMapping(($event.target as HTMLSelectElement)?.value)
              "
            >
              <option selected disabled value="">
                {{ $t("please_select") }}
              </option>
              <option
                v-for="sampleMapping of mappingSampleTemplates"
                :key="'sample-mapping-' + sampleMapping.id"
                :value="sampleMapping.id"
              >
                {{ sampleMapping.name }}
              </option>
            </select>
            <span v-if="formErrorAt.sampleMappingId.length" class="form-error">
              {{ formErrorAt.sampleMappingId }}
            </span>
          </div>
        </div>
        <div
          v-if="!useRuntimeConfig().public.ai4cultureDeployment"
          class="field row separating-row"
        >
          <label class="form-label col" for="select_shape">
            <div class="lbl">
              {{ $t("add_mapping_sidebar.shacl_shape") }}
            </div>
          </label>
          <div class="form-field col">
            <select
              v-model="formData.shaclId"
              class="form-select"
              aria-label="mappingShaclId"
            >
              <option value="">
                {{ $t("add_mapping_sidebar.select_shape") }}
              </option>
              <option
                v-for="shape of shaclSchemata"
                :key="shape.id"
                :value="shape.id"
              >
                {{ shape.name }}
              </option>
            </select>
          </div>
        </div>
        <div v-if="mappingHasParameters" class="field row">
          <label class="form-label col" for="mappingParameter">
            <div class="lbl">{{ $t("add_mapping_sidebar.parameters") }}</div>
            <div class="desc">
              {{ $t("add_mapping_sidebar.parameters_description") }}
            </div>
          </label>
          <div class="form-field col">
            <div class="tags-input-wrapper">
              <span
                v-for="parameter of formData.mappingParameters"
                :key="'parameter-' + parameter.name"
                class="tags-input-badge-pill"
              >
                <span class="val">
                  {{ parameter.name }}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="sage-form-info">
        <div class="notify">{{ $t("mandatory_field_explanation") }}</div>
      </div>
    </ActionSidebarBody>
  </ActionSidebar>
</template>

<script setup lang="ts">
import { useIdentifierValidation } from "./composables/useIdentifierValidation";
import { useCurrentInstanceInfoStore } from "@/stores/currentInstanceInfo";
import { useSidebarDataStore } from "~/stores/sidebarData";
import type { MappingParameter } from "~/types/Mapping";
import type { SchemeFile } from "~/types/SchemeFile";

const { t } = useI18n();
const { toaster } = useToaster();

const { selectedDataset } = storeToRefs(useSidebarDataStore());
const { selectNewDataset } = useSidebarDataStore();
const { mappingSampleTemplates } = storeToRefs(useCurrentInstanceInfoStore());
const { $mappingApi } = useNuxtApp();
const { $getD2rmlSchemata, $getShaclSchemata } = useNuxtApp();
const { identifierError, validateIdentifier } = useIdentifierValidation();

const { selectedMapping, deselectMapping } = useSelectedMapping();
const mapping = computed(() => selectedMapping.value?.mapping);

const emit = defineEmits(["close"]);
const props = defineProps<{ target: string }>();

const addMappingCanvas = ref();
const fileInput = ref();

const hasUserImportedNewFile = ref(false);
const isNewMapping = computed(() => !mapping.value);
const d2rmlSchemata = ref<SchemeFile[]>([]);
const shaclSchemata = ref<SchemeFile[]>([]);

const targetIsCatalog = computed(() => props.target === "catalog");

const formData = ref<{
  type: string;
  name: string;
  active: boolean;
  source: string;
  sampleMappingId: string;
  d2rmlFileContent: string;
  d2rmlFile?: File;
  mappingParameters: Array<MappingParameter>;
  description?: string;
  d2rmlId?: string;
  d2rmlIdBound?: boolean;
  shaclId?: string;
  identifier?: string;
}>({
  type: targetIsCatalog.value ? "HEADER" : "CONTENT",
  name: "",
  active: true,
  source: "empty",
  sampleMappingId: "",
  d2rmlFileContent: "",
  d2rmlFile: undefined,
  mappingParameters: [],
  description: "",
  d2rmlId: "",
  d2rmlIdBound: false,
  shaclId: "",
  identifier: "",
});
const formErrorAt = ref<{
  name: string;
  sampleMappingId: string;
  d2rmlFile: string;
}>({
  name: "",
  sampleMappingId: "",
  d2rmlFile: "",
});

onMounted(() => {
  getShaclSchemata();
});

// If we try to edit the mapping, prepopulate the form
watch(
  () => mapping.value,
  (newValue) => {
    if (!newValue) {
      return;
    }
    formData.value.name = newValue.name;
    formData.value.active = newValue.active;
    formData.value.type = newValue.type;
    formData.value.identifier = newValue.identifier ?? "";
    formData.value.description = newValue.description ?? "";
    formData.value.d2rmlId = newValue.d2rmlId ?? "";
    formData.value.d2rmlIdBound = newValue.d2rmlIdBound ?? false;
    formData.value.shaclId = newValue.shaclId ? newValue.shaclId[0] : "";
    if (newValue.fileName) {
      formData.value.source = "d2rml";
    } else if (newValue.templateId) {
      formData.value.source = "sample";
      formData.value.sampleMappingId = newValue.templateId;
      selectSampleMapping(newValue.templateId);
    } else if (newValue.d2rmlId) {
      getD2rmlSchemata();
      formData.value.source = "d2rml_schema";
    }
  },
  { immediate: true }
);

// When we try to edit a mapping with a D2RML file, we need to make sure
// that the file input showcases the filename
// We achieve that with a dummy file, that does not register to the form
watchEffect(() => {
  if (
    formData.value.source === "d2rml" &&
    fileInput.value &&
    mapping.value?.fileName
  ) {
    if (fileInput.value.files.length > 0) {
      return;
    }
    const dataTransfer = new DataTransfer();
    const file = new File(["Dummy placeholder file!"], mapping.value.fileName, {
      type: "text/plain",
    });
    dataTransfer.items.add(file);
    fileInput.value.files = dataTransfer.files;
  }
});

const handleIdentifierChange = debounce(() => {
  if (
    mapping.value?.id &&
    formData.value.identifier === mapping.value?.identifier
  ) {
    identifierError.value = undefined;
    return;
  }
  validateIdentifier(
    $mappingApi.validateIdentifier,
    t("new_dataset_catalog_sidebar.identifier_error_exists"),
    t("new_dataset_catalog_sidebar.identifier_error_invalid"),
    formData.value.identifier,
    {
      datasetId: selectedDataset.value.id,
    }
  );
});

const mappingHasParameters = computed(
  () => !!formData.value.mappingParameters.length
);

const validMappingPayload = () => {
  if (!formData.value.name.length) {
    formErrorAt.value.name = "You need to provide a mapping name";
    return false;
  }
  if (identifierError.value) {
    toaster.error(identifierError.value.message);
    return;
  }
  if (
    formData.value.source === "sample" &&
    !formData.value.sampleMappingId.length
  ) {
    formErrorAt.value.sampleMappingId = "You need to select a sample mapping";
    return false;
  }
  if (formData.value.source === "d2rml") {
    if (isNewMapping.value && !formData.value.d2rmlFile) {
      formErrorAt.value.d2rmlFile = "You need to upload a D2rml file";
      return false;
    }
    if (formErrorAt.value.d2rmlFile.length) {
      return false;
    }
  }
  return true;
};

const validateD2rmlFile = (event: Event) => {
  const d2rmlFile =
    (event?.target as HTMLInputElement)?.files?.[0] || undefined;

  clearFormErrorAt("d2rmlFile");
  hasUserImportedNewFile.value = true;
  if (d2rmlFile) {
    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target && typeof event.target.result === "string") {
        formData.value.d2rmlFileContent = event.target.result;
        const { data, error }: any = await $mappingApi.validateD2rml(
          formData.value.d2rmlFileContent
        );
        if (error.value) {
          console.error(error.value);
          formErrorAt.value.d2rmlFile = error.value.data.message;
        } else {
          formData.value.mappingParameters = data.value.data?.parameters ?? [];
        }
      }
    };
    reader.readAsText(d2rmlFile);
    formData.value.d2rmlFile = d2rmlFile;
  } else {
    toaster.error("Failed to load D2RML file");
  }
};

const clearFormErrorAt = (
  fieldName: "name" | "d2rmlFile" | "sampleMappingId"
) => {
  formErrorAt.value[fieldName] = "";
};

const getD2rmlSchemata = async () => {
  const { data, error }: any = await $getD2rmlSchemata();
  if (error.value) {
    toaster.error(error.value.data.message);
    return;
  }
  d2rmlSchemata.value = data.value.data;
};
const getShaclSchemata = async () => {
  const { data, error }: any = await $getShaclSchemata();
  if (error.value) {
    toaster.error(error.value.data.message);
    return;
  }
  shaclSchemata.value = data.value.data;
};

const selectMappingSource = () => {
  formData.value.mappingParameters.splice(0);
  formData.value.d2rmlFileContent = "";
  formData.value.d2rmlFile = undefined;
  formData.value.sampleMappingId = "";
  formData.value.d2rmlId = "";
  if (
    d2rmlSchemata.value.length === 0 &&
    formData.value.source === "d2rml_schema"
  ) {
    getD2rmlSchemata();
  }
};

const selectSampleMapping = (id: string) => {
  formErrorAt.value.sampleMappingId = "";
  const foundSampleTemplate = mappingSampleTemplates.value.find(
    (sample) => sample.id === id
  );
  if (foundSampleTemplate) {
    const params = foundSampleTemplate.parameters ?? [];
    formData.value.mappingParameters = params;
  }
};

const saveMapping = async () => {
  if (!validMappingPayload()) {
    return;
  }
  const formdata = new FormData();
  const payload: { [key: string]: any } = {
    name: formData.value.name,
    type: formData.value.type,
    active: formData.value.active,
    description: formData.value.description,
    parameters: formData.value.mappingParameters,
  };
  if (formData.value.identifier) {
    payload.identifier = formData.value.identifier;
  }
  if (formData.value.shaclId) {
    payload.shaclId = [formData.value.shaclId];
  }
  if (formData.value.d2rmlId) {
    payload.d2rmlId = formData.value.d2rmlId;
  }
  if (formData.value.d2rmlIdBound) {
    payload.d2rmlIdBound = formData.value.d2rmlIdBound;
  }
  if (formData.value.sampleMappingId) {
    payload.templateId = formData.value.sampleMappingId;
  }
  if (formData.value.d2rmlFile) {
    formdata.append("file", formData.value.d2rmlFile);
  }
  formdata.append("json", JSON.stringify(payload));

  if (mapping.value?.id) {
    const { error }: any = await $mappingApi.updateMapping(
      mapping.value.id,
      formdata
    );
    if (error.value) {
      toaster.error(error.value.data.message);
    } else {
      toaster.success(
        t("add_mapping_sidebar.success.updating", { mappingName: payload.name })
      );
      closeSidebar();
      await selectNewDataset(selectedDataset.value.id);
    }
  } else {
    const { error }: any = await $mappingApi.createMapping(
      selectedDataset.value.id,
      formdata
    );
    if (error.value) {
      toaster.error(error.value.data.message);
    } else {
      toaster.success(
        t("add_mapping_sidebar.success.creating", { mappingName: payload.name })
      );
      closeSidebar();
      await selectNewDataset(selectedDataset.value.id);
    }
  }
};

const resetMappingForm = () => {
  hasUserImportedNewFile.value = false;

  formData.value.type = targetIsCatalog.value ? "HEADER" : "CONTENT";
  formData.value.name = "";
  formData.value.source = "empty";
  formData.value.sampleMappingId = "";
  formData.value.d2rmlFileContent = "";
  formData.value.d2rmlFile = undefined;
  formData.value.mappingParameters = [];
  formData.value.description = "";
  formData.value.identifier = "";
  formData.value.d2rmlId = "";
  formData.value.d2rmlIdBound = false;
  formData.value.shaclId = "";
  formErrorAt.value.name = "";
  formErrorAt.value.d2rmlFile = "";
  formErrorAt.value.sampleMappingId = "";
};

const closeSidebar = () => {
  resetMappingForm();
  emit("close");
  deselectMapping();
  hideOffcanvas(addMappingCanvas);
};
</script>

<style lang="scss" scoped>
.separating-row:after {
  height: 2px;
}
.tags-input-badge-pill .val {
  border-radius: 4px !important;
  padding: 0 10px !important;
}
.form-error {
  color: red;
  font-size: 12px;
}
</style>
