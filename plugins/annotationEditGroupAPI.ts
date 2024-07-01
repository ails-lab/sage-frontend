export default defineNuxtPlugin(() => {
  const baseUrl = `${useRuntimeConfig().public.baseUrl}/annotation-edit-group`;

  const getAnnotationEditGroups = (datasetId: string) => {
    const token = useCookie("accessToken");
    const getHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    };
    if (!token) {
      return;
    }
    return useFetch(`${baseUrl}/get-all-my?datasetId=${datasetId}`, {
      method: "get",
      headers: getHeaders,
    });
  };

  const updateAnnotationEditGroup = (aegId: string, body: any) => {
    const token = useCookie("accessToken");
    if (!token) {
      return;
    }
    return useFetch(`${baseUrl}/update/${aegId}`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
      body,
    });
  };

  const exportAnnotationsValidations = (
    aegId: string,
    options: { [key: string]: string | boolean }
  ) => {
    const token = useCookie("accessToken");
    if (!token) {
      return;
    }

    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      params.append(key, value.toString());
    });
    return useFetch(
      `${baseUrl}/export-annotations-validations/${aegId}?${params.toString()}`,
      {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );
  };

  return {
    provide: {
      getAnnotationEditGroups,
      updateAnnotationEditGroup,
      exportAnnotationsValidations,
    },
  };
});
