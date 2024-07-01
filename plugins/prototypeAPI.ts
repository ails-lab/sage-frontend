export default defineNuxtPlugin(() => {
  const baseUrl = `${useRuntimeConfig().public.baseUrl}/prototype`;

  const getSchemeFiles = (datasetId: string, type: string) => {
    const token = useCookie("accessToken");
    if (!token) return;
    let url = "";
    if (type === "index") {
      url = `${
        useRuntimeConfig().public.baseUrl
      }/index-structure/get-all?datasetId=${datasetId}&type=${type.toUpperCase()}`;
    } else if (type === "comparator") {
      url = `${
        useRuntimeConfig().public.baseUrl
      }/comparator/get-all?datasetId=${datasetId}`;
    } else {
      url = `${
        useRuntimeConfig().public.baseUrl
      }/prototype/get-all?datasetId=${datasetId}&type=${type.toUpperCase()}`;
    }
    return useFetch(url, {
      method: "get",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
  };
  const createSchemeFile = (datasetId: string, data: FormData) => {
    const token = useCookie("accessToken");
    if (!token) return;
    return useFetch(`${baseUrl}/new?datasetId=${datasetId}`, {
      method: "post",
      body: data,
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
  };
  const updateSchemeFile = (schemeFileId: string, data: FormData) => {
    const token = useCookie("accessToken");
    if (!token) return;
    return useFetch(`${baseUrl}/update/${schemeFileId}`, {
      method: "post",
      body: data,
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
  };
  const deleteSchemeFile = (schemeFileId: string) => {
    const token = useCookie("accessToken");
    if (!token) return;
    return useFetch(`${baseUrl}/delete/${schemeFileId}`, {
      method: "delete",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
  };
  const getSchemeFileDocument = (schemeFileId: string) => {
    const token = useCookie("accessToken");
    if (!token) return;
    return useFetch(`${baseUrl}/get-content/${schemeFileId}`, {
      method: "get",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
  };
  const getD2rmlSchemata = () => {
    const token = useCookie("accessToken");
    if (!token) return;
    return useFetch(`${baseUrl}/get-all?type=D2RML`, {
      method: "get",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
  };
  const getShaclSchemata = () => {
    const token = useCookie("accessToken");
    if (!token) return;
    return useFetch(`${baseUrl}/get-all?type=SHACL`, {
      method: "get",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
  };

  // Dataset API endpoints
  return {
    provide: {
      getSchemeFiles,
      createSchemeFile,
      updateSchemeFile,
      deleteSchemeFile,
      getSchemeFileDocument,
      getD2rmlSchemata,
      getShaclSchemata,
    },
  };
});
