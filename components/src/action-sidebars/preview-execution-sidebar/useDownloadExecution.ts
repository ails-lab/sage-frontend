import type { Optional } from "~/types/optional";

export const useDownloadExecution = (
  selectedExecution: Ref<Optional<SelectedExecutionParams>>
) => {
  const { $mappingApi, $annotatorApi, $pavApi, $filterValApi } = useNuxtApp();

  const { toaster } = useToaster();

  const downloadExecution = async () => {
    if (!selectedExecution.value) {
      return;
    }
    let res;
    if (selectedExecution.value.type === "mapping") {
      const fetchFn = selectedExecution.value.isPublished
        ? $mappingApi.downloadPublishedExecution
        : $mappingApi.downloadLastExecution;
      res = await fetchFn(selectedExecution.value.id);
    } else if (selectedExecution.value.type === "instance") {
      const fetchFn = selectedExecution.value.isPublished
        ? $mappingApi.downloadPublishedExecution
        : $mappingApi.downloadLastExecution;
      res = await fetchFn(
        selectedExecution.value.mappingId,
        selectedExecution.value.id
      );
    } else if (selectedExecution.value.type === "annotator") {
      const fetchFn = selectedExecution.value.isPublished
        ? $annotatorApi.downloadPublishedExecution
        : $annotatorApi.downloadLastExecution;
      res = await fetchFn(selectedExecution.value.id);
    } else if (selectedExecution.value.type === "contributorValidation") {
      const fetchFn = selectedExecution.value.isPublished
        ? $pavApi.downloadPublishedExecution
        : $pavApi.downloadLastExecution;
      res = await fetchFn(selectedExecution.value.id);
    } else if (selectedExecution.value.type === "filterValidation") {
      const fetchFn = selectedExecution.value.isPublished
        ? $filterValApi.downloadPublishedExecution
        : $filterValApi.downloadLastExecution;
      res = await fetchFn(selectedExecution.value.id);
    }
    const { error }: any = res;
    if (error.value) {
      toaster.error(error.value.message);
    }
  };

  return { downloadExecution };
};
