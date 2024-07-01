export const extractThesaurusProperty = (parameter: any) => {
  let thesaurusProperty;
  const thesaurusParam = parameter.values?.find((val: string) =>
    val?.startsWith("{@@thesaurus:")
  );

  if (thesaurusParam) {
    thesaurusProperty = parameter.name;
  }

  return thesaurusProperty;
};
