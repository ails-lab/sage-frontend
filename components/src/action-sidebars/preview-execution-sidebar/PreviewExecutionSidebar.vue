<template>
  <ActionSidebar id="offcanvasPreviewExecution">
    <ActionSidebarHeader :title="title" @close="handleClose">
      <template #description>
        <div class="offcanvas-stats">
          <ul>
            <li>
              <div class="lbl">
                {{ $t("code_sidebar.started_at") }}
              </div>
              <div class="value">
                {{ dateStamp(selectedExecution?.executeState?.startedAt) }}
              </div>
            </li>
            <li>
              <div class="lbl">{{ $t("code_sidebar.completed_at") }}</div>
              <div class="value">
                {{ dateStamp(selectedExecution?.executeState?.completedAt) }}
              </div>
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
    <ActionSidebarBody
      :classname="`${$style['preview-body']} ${$style.editor} ${$style.code}`"
    >
      <CodeBlock
        :is-read-only="true"
        :document-text="text"
        @scrolled-to-bottom="handleBottomReached"
      />
      <div
        :class="[
          $style['download-msg'],
          shouldForbidMorePreview ? $style.show : '',
        ]"
      >
        {{ $t("code_sidebar.download_for_more") }}
      </div>
    </ActionSidebarBody>
  </ActionSidebar>
</template>

<script setup lang="ts">
import { useDownloadExecution } from "./useDownloadExecution";
import { useFetchPreview } from "./useFetchPreview";

const { selectedExecution, deselectExecution } = useSelectedExecution();
const {
  text,
  shouldForbidMorePreview,
  handleBottomReached,
  resetPreviewFetching,
} = useFetchPreview(selectedExecution, 5000);
const { downloadExecution: handleDownload } =
  useDownloadExecution(selectedExecution);

const { t } = useI18n();
const title = computed(() => {
  let executionTypeString = "";
  if (selectedExecution.value?.type === "mapping") {
    executionTypeString = t("code_sidebar.execution.mapping");
  } else if (selectedExecution.value?.type === "instance") {
    executionTypeString = t("code_sidebar.execution.instance");
  } else if (selectedExecution.value?.type === "annotator") {
    executionTypeString = t("code_sidebar.execution.annotator");
  } else if (selectedExecution.value?.type === "contributorValidation") {
    executionTypeString = t("code_sidebar.execution.contributor_validation");
  } else if (selectedExecution.value?.type === "filterValidation") {
    executionTypeString = t("code_sidebar.execution.filter_validation");
  }
  return selectedExecution.value?.isPublished
    ? t("code_sidebar.title.preview_published", {
        type: executionTypeString,
      })
    : t("code_sidebar.title.preview_last", {
        type: executionTypeString,
      });
});

const handleClose = () => {
  deselectExecution();
  resetPreviewFetching();
};
</script>

<style lang="scss" module>
.preview-body.editor.code {
  padding: 0px;
  position: relative;

  .download-msg {
    position: absolute;
    width: 100%;
    height: 60px;
    bottom: 0;
    font-weight: 500;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    opacity: 0;
    transition: opacity 0.5s ease;
    padding-bottom: 20px;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.7) 20%,
      rgb(255, 255, 255) 100%
    );

    &.show {
      opacity: 1;
    }
  }
}
</style>
