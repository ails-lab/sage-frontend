type IdentifierErrorType = "invalid" | "exists";

interface IdentifierError {
  type: IdentifierErrorType;
  message: string;
}

export const useIdentifierValidation = () => {
  const identifierError = ref<IdentifierError>();

  const validateIdentifier = async (
    validateFunction: Function,
    existsMessage: string,
    invalidMessage: string,
    identifierValue?: string,
    extraArgs?: {}
  ) => {
    identifierError.value = undefined;
    if (identifierValue) {
      const { data: res } = extraArgs
        ? await validateFunction(identifierValue, ...Object.values(extraArgs))
        : await validateFunction(identifierValue);
      const { data } = res.value;
      const identifierIsInvalid = !data.valid || data.exists;
      if (identifierIsInvalid) {
        if (!data.valid) {
          identifierError.value = {
            type: "invalid",
            message: invalidMessage,
          };
        } else {
          identifierError.value = {
            type: "exists",
            message: existsMessage,
          };
        }
      }
    }
  };

  return {
    identifierError,
    validateIdentifier,
  };
};
