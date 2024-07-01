<template>
  <ActionSidebar id="offcanvasD2rml" ref="d2rmlCanvas">
    <ActionSidebarHeader
      :title="
        isReadOnly
          ? $t('code_sidebar.title.view', {
              file: $t('code_sidebar.d2rml_file.title'),
            })
          : $t('code_sidebar.title.edit', {
              file: $t('code_sidebar.d2rml_file.title'),
            })
      "
      @close="closeSidebar"
    >
      <template #description>
        <div class="offcanvas-stats">
          <ul>
            <li>
              <div class="lbl">
                {{
                  mappingFilename
                    ? $t("code_sidebar.uploaded")
                    : $t("code_sidebar.created")
                }}
              </div>
              <div class="value">{{ dateStamp(mapping?.createdAt) }}</div>
            </li>
            <li>
              <div class="lbl">{{ $t("code_sidebar.last_modified") }}</div>
              <div class="value">{{ dateStamp(mapping?.updatedAt) }}</div>
            </li>
            <li v-if="mappingFilename">
              <div class="lbl">{{ $t("code_sidebar.filename") }}</div>
              <div class="value">{{ mappingFilename }}</div>
            </li>
          </ul>
          <p v-if="isPublishedOrExecuted" class="edit-warning-disclaimer">
            {{ $t("code_sidebar.d2rml_file.edit_warning") }}
          </p>
        </div>
      </template>
      <template #action>
        <ActionSidebarHeaderAction
          v-if="isReadOnly"
          :aria-label="$t('code_sidebar.buttons.edit')"
          @click="handleEdit"
        >
          {{ $t("code_sidebar.buttons.edit") }}
        </ActionSidebarHeaderAction>
        <ActionSidebarHeaderAction
          v-else
          :aria-label="$t('code_sidebar.buttons.save')"
          @click="handleSave"
        >
          {{ $t("code_sidebar.buttons.save") }}
        </ActionSidebarHeaderAction>
      </template>
    </ActionSidebarHeader>
    <ActionSidebarBody>
      <CodeBlock
        :is-read-only="isReadOnly"
        :document-text="initialDocumentText"
        @change="handleDocChange"
      />
    </ActionSidebarBody>
  </ActionSidebar>
</template>

<script setup lang="ts">
const { t } = useI18n();
const { toaster } = useToaster();

const { $mappingApi, $getSchemeFileDocument, $updateSchemeFile } = useNuxtApp();
const { updateMapping, fetchMySchemes, selectNewScheme } =
  useSidebarDataStore();
const { selectedScheme } = storeToRefs(useSidebarDataStore());

const { selectedD2rml, deselectD2rmlPreview } = useSelectedD2rml();
const { selectedSchemeFile } = useSelectedSchemeFile();
const mapping = computed(() => selectedD2rml.value?.mapping);
const scheme = computed(() => selectedD2rml.value?.scheme);
const isInEditMode = computed(() => selectedD2rml.value?.mode === "edit");

const emit = defineEmits(["close", "save", "edit"]);

const mappingId = computed(() => mapping.value?.id);
const mappingFilename = computed(() => mapping.value?.fileName || "");
const schemeId = computed(() => scheme.value?.id);

const isReadOnly = ref(!isInEditMode.value);
const isFetching = ref(false);
const initialDocumentText = ref("");
const documentText = ref("");

const isPublishedOrExecuted = computed(() =>
  mapping.value?.instances.some(
    (instance) =>
      ["EXECUTED", "EXECUTING"].includes(instance.executeState.state) ||
      instance.executeState.state !== "NOT_EXECUTED" ||
      ["PUBLISHED", "PUBLISHING", "UNPUBLISHING_FAILED"].includes(
        instance.publishState.state
      )
  )
);

watch(
  () => isInEditMode.value,
  (newValue) => {
    isReadOnly.value = !newValue;
  }
);

watch(
  () => mappingId.value,
  async (newValue) => {
    if (newValue) {
      isFetching.value = true;
      const { data, error }: any = await $mappingApi.getD2rmlDocumentContent(
        newValue
      );

      if (error.value) {
        toaster.error(t("There was an error fetching D2rml file content"));
      } else {
        initialDocumentText.value = data?.value?.data || "";
        documentText.value = initialDocumentText.value;
      }
      isFetching.value = false;
    } else {
      initialDocumentText.value = "";
      documentText.value = "";
    }
  }
);

watch(
  () => schemeId.value,
  async (newValue) => {
    if (newValue) {
      isFetching.value = true;
      const { data, error }: any = await $getSchemeFileDocument(newValue);

      if (error.value) {
        toaster.error("There was an error fetching the Scheme File content");
      } else {
        initialDocumentText.value = data?.value?.data || "";
        documentText.value = initialDocumentText.value;
      }
      isFetching.value = false;
    } else {
      initialDocumentText.value = "";
      documentText.value = "";
    }
  }
);

const handleEdit = () => {
  isReadOnly.value = false;
  emit("edit");
};

const handleSave = async () => {
  if (mapping.value && !mappingId.value) {
    toaster.error("No mapping id found");
    closeSidebar();
    return;
  }
  if (scheme.value && !schemeId.value) {
    toaster.error("No scheme id found");
    closeSidebar();
    return;
  }
  if (!documentText.value.length) {
    toaster.error(
      t("error.empty", { item: t("code_sidebar.d2rml_file.text") })
    );
    return;
  }

  // Validate this D2rml File
  const { data, error: validationError }: any = await $mappingApi.validateD2rml(
    documentText.value
  );
  if (validationError?.value) {
    toaster.error(
      validationError.value.data.message ||
        t("error.not_valid", { item: t("code_sidebar.d2rml_file.text") })
    );
    return;
  }

  const formData = mappingId.value
    ? await prepareMappingPayload(data)
    : await prepareSchemePayload();

  try {
    if (mappingId.value) {
      await updateMapping(mappingId.value, formData);
    } else {
      await $updateSchemeFile(selectedSchemeFile.value?.id || "", formData);
      await fetchMySchemes(selectedScheme.value.scope, 1);
      await selectNewScheme(
        selectedScheme.value.id,
        selectedScheme.value.scope
      );
    }

    isReadOnly.value = true;
    toaster.success(
      t("success.while_updating", {
        item: t("code_sidebar.d2rml_file.text"),
      })
    );

    closeSidebar();
  } catch (error: any) {
    toaster.error(
      error ||
        t("error.while_updating", {
          item: t("code_sidebar.d2rml_file.text"),
        })
    );
  }
};

const d2rmlCanvas = ref();
const closeSidebar = () => {
  deselectD2rmlPreview();
  emit("close");
  hideOffcanvas(d2rmlCanvas);
};

const handleDocChange = debounce((docText: string) => {
  documentText.value = docText;
});

const prepareMappingPayload = (data) => {
  const payload = {
    name: mapping.value?.name,
    type: mapping.value?.type,
    active: mapping.value?.active,
    parameters: data.value?.data?.parameters ?? [],
    ...(mapping.value?.templateId
      ? { templateId: mapping.value?.templateId }
      : {}),
  };
  // Populate formData
  const blob = new Blob([documentText.value], { type: "text/plain" });
  const formData = new FormData();
  formData.append("file", blob, mappingFilename.value);
  formData.append("json", JSON.stringify(payload));

  return formData;
};

const prepareSchemePayload = () => {
  const payload = {
    name: scheme.value.name,
    ...(scheme.value.description?.length
      ? { description: scheme.value.description }
      : {}),
  };
  const blob = new Blob([documentText.value], { type: "text/plain" });
  const formData = new FormData();
  formData.append("file", blob);
  formData.append("json", JSON.stringify(payload));

  return formData;
};
</script>

<style scoped lang="scss">
@import "@styles/variables.scss";
.edit-warning-disclaimer {
  font-size: 13px;
  font-style: italic;
  line-height: 17px;
  color: $accent-red;
  margin-bottom: 0;
  margin-top: 0.5rem;
}
</style>
