export default defineNuxtPlugin(() => {
  const baseUrl = `${
    useRuntimeConfig().public.baseUrl
  }/paged-annotation-validation`;

  const getPavById = (id: string) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;

    return useFetch(`${baseUrl}/get/${id}`, {
      method: "get",
      headers,
    });
  };
  const resolvePavUri = (id: string, uri: string) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;

    return useFetch(`${baseUrl}/vocabularies/${id}/resolve?resource=${uri}`, {
      method: "get",
      headers,
    });
  };
  const getPavProgress = (id: string) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;

    return useFetch(`${baseUrl}/get/${id}?details=base,progress`, {
      method: "get",
      headers,
    });
  };
  const getPavPage = (
    id: string,
    queryParams: {
      currentPage: number;
      mode: string;
      navigation?: string;
      requestedPage?: number;
    }
  ) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;

    const regex = /.*_SPECIFIC_PAGE$/;
    const extraParam = regex.test(queryParams.mode)
      ? `&requestedPage=${queryParams.requestedPage}`
      : `&navigation=${queryParams.navigation}`;
    return useFetch(
      `${baseUrl}/view/${id}?currentPage=${queryParams.currentPage}&mode=${queryParams.mode}${extraParam}`,
      {
        method: "get",
        headers,
      }
    );
  };
  const removeLock = (pavId: string, mode: string, page: number) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;

    return useFetch(
      `${baseUrl}/remove-lock/${pavId}?mode=${mode}&page=${page}`,
      {
        method: "post",
        headers,
      }
    );
  };
  const commitPage = (pavId: string, lockId: string, body: {}) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;

    return useFetch(`${baseUrl}/commit-page/${pavId}?lockId=${lockId}`, {
      method: "post",
      headers,
      body,
    });
  };

  const create = (aeId: string, body: {}) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;

    return useFetch(`${baseUrl}/new?aegId=${aeId}`, {
      method: "post",
      headers,
      body,
    });
  };

  const update = (pavId: string, body: {}) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;

    return useFetch(`${baseUrl}/update/${pavId}`, {
      method: "post",
      headers,
      body,
    });
  };

  const deletePav = (id: string) => {
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

  const resumeValidation = (id: string) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;

    // TODO: - ask for the produces = 'application/json' param
    return useFetch(`${baseUrl}/resume/${id}`, {
      method: "post",
      headers,
    });
  };

  const stopValidation = (id: string) => {
    const token = useCookie("accessToken");
    const headers = token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        }
      : undefined;

    return useFetch(`${baseUrl}/stop/${id}`, {
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

  // Paged Annotation Validation API endpoints
  return {
    provide: {
      pavApi: {
        getPavById,
        resolvePavUri,
        getPavProgress,
        getPavPage,
        removeLock,
        commitPage,
        create,
        update,
        deletePav,
        publish,
        unpublish,
        resumeValidation,
        stopValidation,
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
