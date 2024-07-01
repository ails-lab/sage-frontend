export default defineNuxtPlugin(() => {
  const baseUrl = `${useRuntimeConfig().public.baseUrl}/database`;

  const getServices = () => {
    const token = useCookie("accessToken");
    return useFetch(`${baseUrl}/services`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    });
  };
  const getFunctions = () => {
    const token = useCookie("accessToken");
    return useFetch(`${baseUrl}/functions`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    });
  };
  const getImportTemplates = () => {
    const token = useCookie("accessToken");
    return useFetch(`${baseUrl}/templates`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    });
  };
  const getValidationModes = () => {
    const token = useCookie("accessToken");
    return useFetch(`${baseUrl}/validation-modes`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    });
  };
  const getIndexStructures = () => {
    const token = useCookie("accessToken");
    return useFetch(`${baseUrl}/index-structures`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    });
  };
  const getInstance = () => {
    const token = useCookie("accessToken");
    return useFetch(`${baseUrl}/current`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    });
  };
  const getRdfVocabularies = () => {
    const token = useCookie("accessToken");
    return useFetch(`${baseUrl}/rdf-vocabularies`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    });
  };
  // current instance calls endpoints
  return {
    provide: {
      getServices: () => getServices(),
      getFunctions: () => getFunctions(),
      getImportTemplates: () => getImportTemplates(),
      getValidationModes: () => getValidationModes(),
      getIndexStructures: () => getIndexStructures(),
      getInstance: () => getInstance(),
      getRdfVocabularies: () => getRdfVocabularies(),
    },
  };
});
