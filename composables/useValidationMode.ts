export const useValidationMode = () => {
  const { validationModesDimensions } = storeToRefs(
    useCurrentInstanceInfoStore()
  );

  const extractValidationLabelsFromCode = (modeCode: string) => {
    let label = "By ";
    const dimensionsLabels: { value: string; label: string }[] = [];

    const modeCodeSplitted = modeCode.split("-");

    modeCodeSplitted.forEach((code) => {
      const dimension = validationModesDimensions.value.find((d) =>
        code.startsWith(d.code)
      );
      if (dimension) {
        if (dimension) {
          label += `${dimension.name} & `;

          const codeSplitted = code.split(":");
          const codeValue = codeSplitted[codeSplitted.length - 1];
          const codeValueText =
            codeValue === "ASC" ? "Ascending" : "Descending";

          dimensionsLabels.push({
            label: dimension.name,
            value: codeValueText,
          });
        }
      }
    });

    return { label: label.slice(0, -3), dimensionsLabels };
  };

  return { extractValidationLabelsFromCode };
};
