export const useThesaurusProperties = (formValues: Ref<any>) => {
  const { $getThesaurusMetadata } = useNuxtApp();
  const { toaster } = useToaster();

  const thesaurusProperties = ref();
  watch(
    () => formValues.value?.thesaurus,
    (thesaurusId) => {
      if (thesaurusId) {
        fetchThesaurusMetadata(thesaurusId);
      }
    }
  );

  const fetchThesaurusMetadata = async (thesaurusId: string) => {
    const { data, error }: any = await $getThesaurusMetadata(thesaurusId);
    if (error.value) {
      toaster.error(error.value.message);
      thesaurusProperties.value = undefined;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, type, title, ...properties } = data.value.data;
    thesaurusProperties.value = properties;
  };

  const emptyThesaurusProperties = () =>
    (thesaurusProperties.value = undefined);

  return { thesaurusProperties, emptyThesaurusProperties };
};
