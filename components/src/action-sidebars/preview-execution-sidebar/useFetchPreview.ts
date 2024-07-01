import type { Optional } from "~/types/optional";

export const useFetchPreview = (
  selectedExecution: Ref<Optional<SelectedExecutionParams>>,
  maxLines: number = 1000
) => {
  const text = ref("");
  const isEndReached = ref(false);
  const offset = ref(0);
  const shouldForbidMorePreview = ref(false);

  watch(
    () => selectedExecution.value,
    () => {
      fetchMoreExecutionText();
    }
  );

  const handleBottomReached = () => {
    if (isEndReached.value) {
      return;
    } else if (offset.value >= maxLines) {
      shouldForbidMorePreview.value = true;
      return;
    }
    fetchMoreExecutionText();
  };

  const handleNewText = (newText: string) => {
    if (typeof newText !== "string") {
      return;
    }
    const newTextLines = newText.split("\n") as Array<string>;
    if (newTextLines.length < 2) {
      return;
    }
    const [, offsetInfo, ...actualTextLines] = newTextLines;
    const numberOfNewLines = offsetInfo.split("/")[0];

    text.value += actualTextLines.join("\n");
    offset.value += 500;

    if (Number(numberOfNewLines) < 500) {
      isEndReached.value = true;
    }
  };

  const resetPreviewFetching = () => {
    text.value = "";
    isEndReached.value = false;
    offset.value = 0;
    shouldForbidMorePreview.value = false;
  };

  const { toaster } = useToaster();
  const { $mappingApi, $annotatorApi, $pavApi, $filterValApi } = useNuxtApp();

  const fetchMoreExecutionText = async () => {
    if (!selectedExecution.value) {
      return;
    }
    let res;
    if (selectedExecution.value.type === "instance") {
      const fetchFn = selectedExecution.value.isPublished
        ? $mappingApi.previewPublishedExecution
        : $mappingApi.previewLastExecution;
      res = await fetchFn({
        mappingId: selectedExecution.value.mappingId,
        instanceId: selectedExecution.value.id,
        offset: offset.value,
      });
    } else if (selectedExecution.value.type === "mapping") {
      const fetchFn = selectedExecution.value.isPublished
        ? $mappingApi.previewPublishedExecution
        : $mappingApi.previewLastExecution;
      res = await fetchFn({
        mappingId: selectedExecution.value.id,
      });
    } else if (selectedExecution.value.type === "annotator") {
      const fetchFn = selectedExecution.value.isPublished
        ? $annotatorApi.previewLastExecution
        : $annotatorApi.previewPublishedExecution;
      res = await fetchFn(selectedExecution.value.id, offset.value);
    } else if (selectedExecution.value.type === "contributorValidation") {
      const fetchFn = selectedExecution.value.isPublished
        ? $pavApi.previewLastExecution
        : $pavApi.previewPublishedExecution;
      res = await fetchFn(selectedExecution.value.id, offset.value);
    } else if (selectedExecution.value.type === "filterValidation") {
      const fetchFn = selectedExecution.value.isPublished
        ? $filterValApi.previewLastExecution
        : $filterValApi.previewPublishedExecution;
      res = await fetchFn(selectedExecution.value.id, offset.value);
    }
    const { data, error }: any = res;
    if (error.value) {
      toaster.error(error.value.message);
      return;
    }
    handleNewText(data.value);
  };

  return {
    text,
    shouldForbidMorePreview,
    handleBottomReached,
    resetPreviewFetching,
  };
};
