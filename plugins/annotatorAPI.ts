export default defineNuxtPlugin(() => {
  const baseUrl = `${useRuntimeConfig().public.baseUrl}/annotator`;

  const fetchAll = (datasetId: string) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;
    return useFetch(`${baseUrl}/get-all?datasetId=${datasetId}`, {
      method: "get",
      headers,
    });
  };

  const create = (datasetId: string, data: object) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;
    return useFetch(`${baseUrl}/new?datasetId=${datasetId}`, {
      method: "post",
      headers,
      body: data,
    });
  };

  const update = (annotatorId: string, data: object) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;
    return useFetch(`${baseUrl}/update/${annotatorId}`, {
      method: "post",
      headers,
      body: data,
    });
  };

  const deleteAnnotator = (annotatorId: string) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;
    return useFetch(`${baseUrl}/delete/${annotatorId}`, {
      method: "delete",
      headers,
    });
  };

  const execute = (annotatorId: string) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;
    return useFetch(`${baseUrl}/execute/${annotatorId}`, {
      method: "post",
      headers,
    });
  };

  const stopExecution = (annotatorId: string) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;
    return useFetch(`${baseUrl}/stop-execution/${annotatorId}`, {
      method: "post",
      headers,
    });
  };

  const prepare = (annotatorId: string) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;
    return useFetch(`${baseUrl}/prepare/${annotatorId}`, {
      method: "post",
      headers,
    });
  };

  const previewAnnotations = (annotatorId: string, page: number) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;
    return useFetch(`${baseUrl}/preview/${annotatorId}?page=${page}`, {
      method: "get",
      headers,
    });
  };

  const publish = (annotatorId: string) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;
    return useFetch(`${baseUrl}/publish/${annotatorId}`, {
      method: "post",
      headers,
    });
  };

  const unpublish = (annotatorId: string) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;
    return useFetch(`${baseUrl}/unpublish/${annotatorId}`, {
      method: "post",
      headers,
    });
  };

  const republish = (annotatorId: string) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;
    return useFetch(`${baseUrl}/republish/${annotatorId}`, {
      method: "post",
      headers,
    });
  };

  const previewLastExecution = (annotatorId: string, offset?: number) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;
    let url = `${baseUrl}/preview-last-execution/${annotatorId}`;
    if (offset) {
      url += `?shard=0&offset=${offset}`;
    }
    return useFetch(url, {
      method: "get",
      headers,
    });
  };

  const downloadLastExecution = (annotatorId: string) =>
    downloadFile(`${baseUrl}/download-last-execution/${annotatorId}`);

  const clearLastExecution = (annotatorId: string) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;
    return useFetch(`${baseUrl}/clear-execution/${annotatorId}`, {
      method: "post",
      headers,
    });
  };

  const previewPublishedExecution = (annotatorId: string, offset?: number) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;
    let url = `${baseUrl}/preview-published-execution/${annotatorId}`;
    if (offset) {
      url += `?shard=0&offset=${offset}`;
    }
    return useFetch(url, {
      method: "get",
      headers,
    });
  };

  const downloadPublishedExecution = (annotatorId: string) =>
    downloadFile(`${baseUrl}/download-published-execution/${annotatorId}`);

  return {
    provide: {
      annotatorApi: {
        fetchAll,
        create,
        update,
        deleteAnnotator,
        execute,
        stopExecution,
        prepare,
        publish,
        unpublish,
        republish,
        previewAnnotations,
        previewLastExecution,
        downloadLastExecution,
        clearLastExecution,
        previewPublishedExecution,
        downloadPublishedExecution,
      },
    },
  };
});
