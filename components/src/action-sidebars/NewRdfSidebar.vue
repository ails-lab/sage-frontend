<template>
  <ActionSidebar id="offcanvasAddRdf" ref="addRdfCanvas">
    <ActionSidebarHeader
      :title="$t(`add_rdf_sidebar.title.${rdfToEdit ? 'edit' : 'new'}`)"
      :description="$t('add_rdf_sidebar.description')"
      @close="closeSidebar()"
    >
      <template #action>
        <ActionSidebarHeaderAction
          :aria-label="$t('save')"
          @click="saveRdfDataFile()"
        >
          {{ $t("save") }}
        </ActionSidebarHeaderAction>
      </template>
    </ActionSidebarHeader>
    <ActionSidebarBody>
      <div class="sage-form">
        <div class="field row">
          <label class="form-label col" for="rdfName">
            <div class="lbl">{{ $t("name") }} *</div>
            <div class="desc"></div>
          </label>
          <div class="form-field col">
            <input
              v-model="formValues.name"
              class="form-control"
              type="text"
              aria-label="rdfName"
              @input="clearFormErrorAt('name')"
            />
          </div>
        </div>
        <div class="field row">
          <label class="form-label col" for="rdfDescription">
            <div class="lbl">{{ $t("description") }}</div>
            <div class="desc"></div>
          </label>
          <div class="form-field col">
            <input
              v-model="formValues.description"
              class="form-control"
              type="text"
              aria-label="rdfDescription"
            />
          </div>
        </div>
        <div class="field row">
          <label class="form-label col" for="rdfFile">
            <div class="lbl">{{ $t("add_rdf_sidebar.data_file") }} *</div>
            <div class="desc"></div>
          </label>
          <div class="form-field col">
            <input
              ref="fileInputRef"
              class="form-control"
              type="file"
              aria-label="rdfFile"
              accept=".ttl, .trig, .zip, .xml"
              @change="handleRdfFileChange($event)"
            />
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
import { RdfDataFileProp } from "@/types/RdfDataFile";

const { t } = useI18n();
const { toaster } = useToaster();

const { selectedDataset } = storeToRefs(useSidebarDataStore());
const { selectNewDataset } = useSidebarDataStore();
const { $createRdfDataFile, $updateRdfFile } = useNuxtApp();

const emit = defineEmits(["close"]);

const props = defineProps({
  rdfToEdit: {
    type: RdfDataFileProp,
    default: undefined,
  },
});

const formErrorAt = ref<{ name?: string; rdfFile?: string }>({});

const addRdfCanvas = ref();
const fileInputRef = ref<HTMLInputElement | null>(null);

const formValues = computed(
  (): {
    active: boolean;
    name: string;
    description: string;
    rdfFile?: File | { name: string };
  } => {
    if (fileInputRef.value) {
      const fileList = new DataTransfer();
      if (props.rdfToEdit?.executeState?.fileName) {
        const file = new File([], props.rdfToEdit.executeState?.fileName);
        fileList.items.add(file);
        fileInputRef.value.files = fileList.files;
      } else {
        fileList.items.clear();
        fileInputRef.value.files = fileList.files;
      }
    }
    return {
      active: true,
      name: props.rdfToEdit?.name || "",
      description: props.rdfToEdit?.description || "",
      rdfFile: undefined,
    };
  }
);

const handleRdfFileChange = (event: Event) => {
  formValues.value.rdfFile =
    (event?.target as HTMLInputElement)?.files?.[0] || undefined;

  clearFormErrorAt("rdfFile");
};

const validateForm = ({
  skipName,
  skipRdfFile,
}: {
  skipName?: boolean;
  skipRdfFile?: boolean;
} = {}) => {
  if (!skipName && !formValues.value.name.length) {
    formErrorAt.value.name = t("add_rdf_sidebar.error_name_required");
    return false;
  }
  if (!skipRdfFile && !formValues.value.rdfFile) {
    formErrorAt.value.rdfFile = t("add_rdf_sidebar.error_file_required");
    return false;
  }
  return true;
};

const clearFormErrorAt = (fieldName: "name" | "rdfFile") => {
  formErrorAt.value[fieldName] = "";
};

const resetRdfForm = () => {
  formValues.value.name = "";
  formValues.value.rdfFile = undefined;
};

const saveRdfDataFile = async () => {
  const isValid = props.rdfToEdit
    ? validateForm({ skipRdfFile: true })
    : validateForm();
  if (!isValid) {
    return;
  }

  const { rdfFile, ...payload } = formValues.value;

  const formdata = new FormData();
  if (rdfFile) {
    formdata.append("file", rdfFile as File);
  }
  formdata.append("json", JSON.stringify(payload));

  let error;

  if (props.rdfToEdit) {
    const { error: updateError } = await $updateRdfFile(
      props.rdfToEdit?.id,
      formdata
    );
    error = updateError;
  } else {
    const { error: creationError } = await $createRdfDataFile(
      selectedDataset.value.id,
      formdata
    );
    error = creationError;
  }

  if (error.value) {
    toaster.error(t("add_rdf_sidebar.error_post_new_rdf"));
    return;
  }
  toaster.success(t("add_rdf_sidebar.success_post_new_rdf"));
  setTimeout(async () => {
    await selectNewDataset(selectedDataset.value.id);
    closeSidebar();
  }, 300);
};

const closeSidebar = () => {
  emit("close");
  resetRdfForm();
  hideOffcanvas(addRdfCanvas);
};
</script>

<style lang="scss" scoped></style>
