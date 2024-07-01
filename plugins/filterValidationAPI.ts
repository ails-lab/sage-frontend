export default defineNuxtPlugin(() => {
  const baseUrl = `${
    useRuntimeConfig().public.baseUrl
  }/filter-annotation-validation`;

  const create = (aegId: string, body: object) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;

    return useFetch(`${baseUrl}/new?aegId=${aegId}`, {
      method: "post",
      body,
      headers,
    });
  };

  const update = (id: string, body: object) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;

    return useFetch(`${baseUrl}/update/${id}`, {
      method: "post",
      body,
      headers,
    });
  };

  const deleteFilterValidation = (id: string) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;

    return useFetch(`${baseUrl}/delete/${id}`, {
      method: "delete",
      headers,
    });
  };

  const publish = (id: string) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;

    return useFetch(`${baseUrl}/publish/${id}`, {
      method: "post",
      headers,
    });
  };

  const unpublish = (id: string) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;

    return useFetch(`${baseUrl}/unpublish/${id}`, {
      method: "post",
      headers,
    });
  };

  const execute = (id: string) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;

    return useFetch(`${baseUrl}/execute/${id}`, {
      method: "post",
      headers,
    });
  };

  const stopExecution = (id: string) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;

    return useFetch(`${baseUrl}/stop-execution/${id}`, {
      method: "post",
      headers,
    });
  };

  const previewLastExecution = (id: string, offset?: number) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;

    let url = `${baseUrl}/preview-last-execution/${id}`;
    if (offset) {
      url += `?shard=0&offset=${offset}`;
    }
    return useFetch(url, {
      method: "get",
      headers,
    });
  };

  const downloadLastExecution = (id: string) =>
    downloadFile(`${baseUrl}/download-last-execution/${id}`);

  const clearLastExecution = (id: string) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;

    return useFetch(`${baseUrl}/clear-execution/${id}`, {
      method: "post",
      headers,
    });
  };

  const previewPublishedExecution = (id: string, offset?: number) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;

    let url = `${baseUrl}/preview-published-execution/${id}`;
    if (offset) {
      url += `?shard=0&offset=${offset}`;
    }
    return useFetch(url, {
      method: "get",
      headers,
    });
  };

  const downloadPublishedExecution = (id: string) =>
    downloadFile(`${baseUrl}/download-published-execution/${id}`);

  // API endpoints
  return {
    provide: {
      filterValApi: {
        create,
        update,
        deleteFilterValidation,
        publish,
        unpublish,
        execute,
        stopExecution,
        previewLastExecution,
        downloadLastExecution,
        clearLastExecution,
        previewPublishedExecution,
        downloadPublishedExecution,
      },
    },
  };
});
