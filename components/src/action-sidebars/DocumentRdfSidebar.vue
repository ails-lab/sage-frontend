<template>
  <ActionSidebar id="offcanvasRdf">
    <ActionSidebarHeader
      :title="
        $t('code_sidebar.title.view', {
          file: $t('code_sidebar.rdf_file'),
        })
      "
      @close="handleClose"
    >
      <template #description>
        <div class="offcanvas-stats">
          <ul>
            <li>
              <div class="lbl">
                {{ $t("code_sidebar.uploaded") }}
              </div>
              <div class="value">{{ dateStamp(rdfFile?.createdAt) }}</div>
            </li>
            <li>
              <div class="lbl">{{ $t("code_sidebar.last_modified") }}</div>
              <div class="value">{{ dateStamp(rdfFile?.updatedAt) }}</div>
            </li>
            <li v-if="rdfFileName">
              <div class="lbl">{{ $t("code_sidebar.filename") }}</div>
              <div class="value">{{ rdfFileName }}</div>
            </li>
          </ul>
        </div>
      </template>
      <template #action>
        <ActionSidebarHeaderAction
          :aria-label="$t('code_sidebar.buttons.download')"
          @click="handleDownload"
        >
          {{ $t("code_sidebar.buttons.download") }}
        </ActionSidebarHeaderAction>
      </template>
    </ActionSidebarHeader>
    <ActionSidebarBody>
      <CodeBlock :is-read-only="true" :document-text="documentText" />
    </ActionSidebarBody>
  </ActionSidebar>
</template>

<script setup lang="ts">
import { RdfDataFileProp } from "@/types/RdfDataFile";

const { t } = useI18n();
const { toaster } = useToaster();

const {
  $previewRdfFile,
  $previewPublishedRdfFile,
  $downloadRdfFile,
  $downloadPublishedRdfFile,
} = useNuxtApp();

const emit = defineEmits(["close", "save", "edit"]);
const props = defineProps({
  rdfFile: {
    type: RdfDataFileProp,
    default: null,
  },
  isPublished: {
    type: Boolean,
  },
});

const rdfFileId = computed(() => props.rdfFile?.id);
const rdfFileName = computed(() => props.rdfFile?.executeState?.fileName || "");

const isFetching = ref(false);
const documentText = ref("");

watch(
  () => rdfFileId.value,
  async (newValue) => {
    if (newValue) {
      isFetching.value = true;
      if (props.isPublished) {
        const { data, error }: any = await $previewPublishedRdfFile(newValue);
        if (error.value) {
          throw new Error(error.value);
        } else {
          documentText.value = data?.value || "";
        }
      } else {
        const { data, error }: any = await $previewRdfFile(newValue);
        if (error.value) {
          throw new Error(error.value);
        } else {
          documentText.value = data?.value || "";
        }
      }
      isFetching.value = false;
    }
  }
);

const handleClose = () => {
  emit("close");
};

const handleDownload = async () => {
  if (props.isPublished) {
    const { error } = await $downloadPublishedRdfFile(rdfFileId.value);
    if (error.value) {
      toaster.error(
        t("error.while_downloading", {
          item: rdfFileName.value,
        })
      );
    }
  } else {
    const { error } = await $downloadRdfFile(rdfFileId.value);
    if (error.value) {
      toaster.error(
        t("error.while_downloading", {
          item: rdfFileName.value,
        })
      );
    }
  }
};
</script>
