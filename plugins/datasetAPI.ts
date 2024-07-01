import type { SchemeType } from "@/types/Dataset";

export default defineNuxtPlugin(() => {
  const baseUrl = `${useRuntimeConfig().public.baseUrl}/dataset`;

  const getDatasetWithDetailsById = (id: string) => {
    const token = useCookie("accessToken");
    const getHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    };
    if (!token) {
      return;
    }
    return useFetch(`${baseUrl}/get/${id}?details=true`, {
      method: "get",
      headers: getHeaders,
    });
  };
  const getMyCatalogs = (page?: number) => {
    const token = useCookie("accessToken");
    const getHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    };
    if (!token) {
      return;
    }
    const pageNum = page ? `&page=${page}&size=10` : "";
    return useFetch(`${baseUrl}/get-all-my?type=CATALOG${pageNum}`, {
      method: "get",
      headers: getHeaders,
    });
  };
  const getMyDatasets = (page?: number) => {
    const token = useCookie("accessToken");
    const getHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    };
    if (!token) {
      return;
    }
    const pageNum = page ? `&page=${page}&size=10` : "";
    return useFetch(
      `${baseUrl}/get-all-my?type=DATASET&scope=COLLECTION&scope=VOCABULARY&scope=ALIGNMENT${pageNum}`,
      {
        method: "get",
        headers: getHeaders,
      }
    );
  };
  const getMyDatasetsWithScope = (scope: string, page?: number) => {
    const token = useCookie("accessToken");
    const getHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    };
    if (!token) {
      return;
    }
    const pageNum = page ? `&page=${page}&size=10` : "";
    return useFetch(
      `${baseUrl}/get-all-my?type=DATASET&scope=${scope}${pageNum}`,
      {
        method: "get",
        headers: getHeaders,
      }
    );
  };
  const validateIdentifier = (identifier: string) => {
    const token = useCookie("accessToken");
    const getHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    };
    if (!token) {
      return;
    }
    return useFetch(`${baseUrl}/exists-identifier?identifier=${identifier}`, {
      method: "get",
      headers: getHeaders,
    });
  };
  const createNewCatalog = (
    name: string,
    identifier: string,
    isPublic: boolean
  ) => {
    const token = useCookie("accessToken");
    const getHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    };
    if (!token) {
      return;
    }
    return useFetch(`${baseUrl}/create`, {
      method: "post",
      headers: getHeaders,
      body: {
        name,
        ...(identifier?.length ? { identifier } : {}),
        public: isPublic,
        scope: "COLLECTION",
        type: "CATALOG",
      },
    });
  };
  const createNewDataset = (
    name: string,
    identifier: string,
    isPublic: boolean,
    scope: string,
    location: string
  ) => {
    const token = useCookie("accessToken");
    const getHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    };
    if (!token) {
      return;
    }

    const body = {
      name,
      ...(identifier?.length ? { identifier } : {}),
      scope,
      public: isPublic,
      type: "DATASET",
      category: "DATA",
    };
    if (location === "REMOTE")
      body.remoteTripleStore = { sparqlEndpoint: "spark1" };

    return useFetch(`${baseUrl}/create`, {
      method: "post",
      headers: getHeaders,
      body,
    });
  };
  const createNewScheme = (
    name: string,
    identifier: string,
    scope: string,
    visibility: boolean
  ) => {
    const token = useCookie("accessToken");
    const getHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    };
    if (!token) {
      return;
    }

    const body = {
      name,
      ...(identifier?.length ? { identifier } : {}),
      public: visibility,
      type: "DATASET",
      category: "PROTOTYPE",
      scope,
    };

    return useFetch(`${baseUrl}/create`, {
      method: "post",
      headers: getHeaders,
      body,
    });
  };
  const editDataset = (
    id: string,
    name: string,
    identifier: string,
    isPublic: boolean,
    scope: string,
    location: string
  ) => {
    const token = useCookie("accessToken");
    const getHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    };
    if (!token) {
      return;
    }

    const body = {
      name,
      ...(identifier?.length ? { identifier } : {}),
      scope,
      public: isPublic,
      type: "DATASET",
      category: "DATA",
    };
    if (location === "REMOTE")
      body.remoteTripleStore = { sparqlEndpoint: "spark1" };

    return useFetch(`${baseUrl}/update/${id}`, {
      method: "post",
      headers: getHeaders,
      body,
    });
  };

  const editCatalog = (
    id: string,
    name: string,
    identifier: string,
    isPublic: boolean
  ) => {
    const token = useCookie("accessToken");
    const getHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    };
    if (!token) {
      return;
    }
    return useFetch(`${baseUrl}/update/${id}`, {
      method: "post",
      headers: getHeaders,
      body: {
        name,
        ...(identifier?.length ? { identifier } : {}),
        public: isPublic,
        scope: "COLLECTION",
        type: "CATALOG",
      },
    });
  };

  const editScheme = (
    id: string,
    name: string,
    identifier: string,
    scope: string,
    visibility: boolean
  ) => {
    const token = useCookie("accessToken");
    const getHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    };
    if (!token) {
      return;
    }
    return useFetch(`${baseUrl}/update/${id}`, {
      method: "post",
      headers: getHeaders,
      body: {
        name,
        ...(identifier?.length ? { identifier } : {}),
        scope,
        public: visibility,
        type: "DATASET",
        category: "PROTOTYPE",
      },
    });
  };

  const deleteDataset = (id: string) => {
    const token = useCookie("accessToken");
    const getHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    };
    if (!token) {
      return;
    }
    return useFetch(`${baseUrl}/delete/${id}`, {
      method: "delete",
      headers: getHeaders,
    });
  };
  const addOrRemoveDatasetToCatalog = (
    action: string,
    catalogId: string,
    datasetId: string
  ) => {
    const token = useCookie("accessToken");
    const getHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    };
    if (!token) {
      return;
    }
    return useFetch(
      `${baseUrl}/${action}-dataset/${catalogId}?datasetId=${datasetId}`,
      {
        method: "post",
        headers: getHeaders,
      }
    );
  };

  const getDatasetSchema = (datasetId: string) => {
    const token = useCookie("accessToken");
    const getHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    };
    if (!token) {
      return;
    }
    return useFetch(`${baseUrl}/schema/${datasetId}/`, {
      method: "get",
      headers: getHeaders,
    });
  };

  const getDatasetSchemaClassItems = (
    datasetId: string,
    mode: string,
    page: number,
    classUri: string,
    propertyUri?: string
  ) => {
    const token = useCookie("accessToken");
    const getHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    };
    if (!token) {
      return;
    }
    const body = [
      {
        type: "CLASS",
        uri: classUri,
      },
    ];
    if (propertyUri) {
      body.push({ type: "PROPERTY", uri: propertyUri });
    }
    return useFetch(
      `${baseUrl}/schema//${datasetId}/list-property-values?mode=${mode}&page=${page}`,
      {
        method: "post",
        headers: getHeaders,
        body,
      }
    );
  };

  const getMyVocabularies = () => {
    const token = useCookie("accessToken");
    const getHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    };
    if (!token) {
      return;
    }
    return useFetch(`${baseUrl}/get-all-my?type=DATASET&scope=VOCABULARY`, {
      method: "get",
      headers: getHeaders,
    });
  };

  const getDatasetRdfFile = (datasetId: string) => {
    const token = useCookie("accessToken");
    const getHeaders = {
      "Content-Type": "text/turtle",
      Authorization: `Bearer ${token.value}`,
    };
    if (!token) {
      return;
    }
    return useFetch(`${baseUrl}/rdf-schema/${datasetId}`, {
      method: "get",
      headers: getHeaders,
    });
  };

  const publishDataset = (id: string) => {
    const token = useCookie("accessToken");
    const getHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    };
    if (!token) {
      return;
    }
    return useFetch(`${baseUrl}/publish/${id}`, {
      method: "post",
      headers: getHeaders,
    });
  };

  const republishDataset = (
    id: string,
    mode: "all" | "onlyNew" | "metadata" = "all"
  ) => {
    const token = useCookie("accessToken");
    const getHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    };
    if (!token) {
      return;
    }
    let param = "";
    switch (mode) {
      case "onlyNew":
        param = "ONLY_NEW";
        break;
      case "metadata":
        param = "NONE";
        break;
      default:
        param = "ALL";
        break;
    }
    return useFetch(`${baseUrl}/republish/${id}?content=${param}`, {
      method: "post",
      headers: getHeaders,
    });
  };

  const unpublishDataset = (id: string) => {
    const token = useCookie("accessToken");
    const getHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    };
    if (!token) {
      return;
    }
    return useFetch(`${baseUrl}/unpublish/${id}`, {
      method: "post",
      headers: getHeaders,
    });
  };

  const getThesaurusMetadata = (id: string) => {
    const token = useCookie("accessToken");
    const getHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    };
    if (!token) {
      return;
    }
    return useFetch(`${baseUrl}/schema/${id}/metadata`, {
      method: "get",
      headers: getHeaders,
    });
  };

  // Dataset API endpoints
  return {
    provide: {
      getDatasetWithDetailsById,
      getMyCatalogs,
      getMyDatasets,
      getMyCollections: (page?: number) =>
        getMyDatasetsWithScope("COLLECTION", page),
      getMySchemes: (type: SchemeType, page?: number) =>
        getMyDatasetsWithScope(type.toUpperCase(), page),
      validateIdentifier,
      createNewCatalog,
      createNewScheme,
      editScheme,
      editCatalog,
      createNewDataset,
      editDataset,
      deleteDataset,
      addDatasetToCatalog: (catalogId: string, datasetId: string) =>
        addOrRemoveDatasetToCatalog("add", catalogId, datasetId),
      removeDatasetFromCatalog: (catalogId: string, datasetId: string) =>
        addOrRemoveDatasetToCatalog("remove", catalogId, datasetId),
      getDatasetSchema,
      getDatasetSchemaClassItems,
      getMyVocabularies,
      getDatasetRdfFile,
      publishDataset,
      republishDataset,
      unpublishDataset,
      getThesaurusMetadata,
    },
  };
});
