export default defineNuxtPlugin(() => {
  const baseUrl = `${useRuntimeConfig().public.baseUrl}/mapping`;

  const createMapping = (datasetId: string, data: FormData) => {
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

  const updateMapping = (mappingId: string, data: FormData) => {
    const token = useCookie("accessToken");
    if (!token) return;
    return useFetch(`${baseUrl}/update/${mappingId}`, {
      method: "post",
      body: data,
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
  };

  const deleteMappingOrInstance = (mappingId: string, instanceId?: string) => {
    const token = useCookie("accessToken");
    if (!token) return;

    let url = `${baseUrl}/delete/${mappingId}`;
    if (instanceId) {
      url += instanceId ? `?instanceId=${instanceId}` : "";
    }
    return useFetch(url, {
      method: "delete",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
  };

  const createMappingInstance = (mappingId: string, data: Object) => {
    const token = useCookie("accessToken");
    if (!token) return;
    return useFetch(`${baseUrl}/create-instance/${mappingId}`, {
      method: "post",
      body: data,
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
  };

  const updateMappingInstance = (
    mappingId: string,
    instanceId: string,
    data: object
  ) => {
    const token = useCookie("accessToken");
    if (!token) return;
    return useFetch(
      `${baseUrl}/update-instance/${mappingId}?instanceId=${instanceId}`,
      {
        method: "post",
        body: data,
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      }
    );
  };

  const validateD2rml = (d2rmlFile: string) => {
    const token = useCookie("accessToken");
    if (!token) return;
    return useFetch(`${useRuntimeConfig().public.baseUrl}/d2rml/validate`, {
      method: "post",
      body: d2rmlFile,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    });
  };

  const getD2rmlDocumentContent = (mappingId: string) => {
    const token = useCookie("accessToken");
    if (!token) return;
    return useFetch(`${baseUrl}/get-content/${mappingId}`, {
      method: "get",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
  };

  const attachSourceDataFile = (
    mappingId: string,
    data: FormData,
    instanceId?: string
  ) => {
    const token = useCookie("accessToken");
    if (!token) return;

    const url = instanceId?.length
      ? `${baseUrl}/upload-attachment/${mappingId}?instanceId=${instanceId}`
      : `${baseUrl}/upload-attachment/${mappingId}`;

    return useFetch(url, {
      method: "post",
      body: data,
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
  };

  const downloadAttachment = (
    mappingId: string,
    filename: string,
    instanceId: string
  ) => {
    let url = `${baseUrl}/download-attachment/${mappingId}?filename=${filename}`;
    url += instanceId.length ? `&instanceId=${instanceId}` : "";
    return downloadFile(url, filename);
  };

  const deleteAttachment = (
    mappingId: string,
    filename: string,
    instanceId: string
  ) => {
    let url = `${baseUrl}/delete-attachment/${mappingId}?filename=${filename}`;
    url += instanceId.length ? `&instanceId=${instanceId}` : "";
    const token = useCookie("accessToken");
    if (!token) return;
    return useFetch(url, {
      method: "delete",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
  };

  const startMappingExecution = (mappingId: string, instanceId?: string) => {
    let url = `${baseUrl}/execute/${mappingId}`;
    if (instanceId) {
      url += `?instanceId=${instanceId}`;
    }
    const token = useCookie("accessToken");
    if (!token) return;
    return useFetch(url, {
      method: "post",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
  };

  const stopMappingExecution = (mappingId: string, instanceId?: string) => {
    let url = `${baseUrl}/stop-execution/${mappingId}`;
    if (instanceId) {
      url += `?instanceId=${instanceId}`;
    }
    const token = useCookie("accessToken");
    if (!token) return;
    return useFetch(url, {
      method: "post",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
  };

  const clearLastExecution = (mappingId: string, instanceId?: string) => {
    let url = `${baseUrl}/clear-execution/${mappingId}`;
    if (instanceId) {
      url += `?instanceId=${instanceId}`;
    }
    const token = useCookie("accessToken");
    if (!token) return;
    return useFetch(url, {
      method: "post",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
  };

  const downloadLastExecution = (mappingId: string, instanceId?: string) => {
    let url = `${baseUrl}/download-last-execution/${mappingId}`;
    if (instanceId) {
      url += `?instanceId=${instanceId}`;
    }
    return downloadFile(url);
  };

  const previewLastExecution = ({
    mappingId,
    instanceId,
    offset,
  }: {
    mappingId: string;
    instanceId?: string;
    offset?: number;
  }) => {
    let url = `${baseUrl}/preview-last-execution/${mappingId}`;
    if (instanceId) {
      url += `?instanceId=${instanceId}`;
    }
    if (offset) {
      url += `&shard=0&offset=${offset}`;
    }
    const token = useCookie("accessToken");
    if (!token) return;
    return useFetch(url, {
      method: "get",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
  };

  const downloadPublishedExecution = (
    mappingId: string,
    instanceId?: string
  ) => {
    let url = `${baseUrl}/download-last-execution/${mappingId}`;
    if (instanceId) {
      url += `?instanceId=${instanceId}`;
    }
    return downloadFile(url);
  };

  const previewPublishedExecution = ({
    mappingId,
    instanceId,
    offset,
  }: {
    mappingId: string;
    instanceId?: string;
    offset?: number;
  }) => {
    let url = `${baseUrl}/preview-published-execution/${mappingId}`;
    if (instanceId) {
      url += `?instanceId=${instanceId}`;
    }
    if (offset) {
      url += `&shard=0&offset=${offset}`;
    }
    const token = useCookie("accessToken");
    if (!token) return;
    return useFetch(url, {
      method: "get",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
  };

  const validateIdentifier = (
    identifier: string,
    datasetId?: string,
    mappingId?: string
  ) => {
    const token = useCookie("accessToken");
    const getHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    };
    if (!token) {
      return;
    }
    const dataset = datasetId ? `&datasetId=${datasetId}` : "";
    const mapping = mappingId ? `&mappingId=${mappingId}` : "";
    return useFetch(
      `${baseUrl}/exists-identifier?identifier=${identifier}${dataset}${mapping}`,
      {
        method: "get",
        headers: getHeaders,
      }
    );
  };

  // API endpoints
  return {
    provide: {
      mappingApi: {
        createMapping,
        updateMapping,
        deleteMapping: (mappingId: string) =>
          deleteMappingOrInstance(mappingId),
        createMappingInstance,
        updateMappingInstance,
        deleteMappingInstance: (mappingId: string, instanceId: string) =>
          deleteMappingOrInstance(mappingId, instanceId),
        validateD2rml,
        getD2rmlDocumentContent,
        attachSourceDataFile,
        downloadAttachment,
        deleteAttachment,
        startMappingExecution,
        stopMappingExecution,
        clearLastExecution,
        downloadLastExecution,
        previewLastExecution,
        downloadPublishedExecution,
        previewPublishedExecution,
        validateIdentifier,
      },
    },
  };
});
