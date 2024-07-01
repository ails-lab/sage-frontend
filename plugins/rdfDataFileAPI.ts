export default defineNuxtPlugin(() => {
  const baseUrl = `${useRuntimeConfig().public.baseUrl}`;

  const createRdfDataFile = (datasetId: string, data: FormData) => {
    const token = useCookie("accessToken");
    if (!token) return;
    return useFetch(`${baseUrl}/files/create?datasetId=${datasetId}`, {
      method: "post",
      body: data,
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
  };

  const deleteRdfDataFile = (id: string) => {
    const token = useCookie("accessToken");
    if (!token) return;
    return useFetch(`${baseUrl}/files/delete/${id}`, {
      method: "delete",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
  };

  const downloadRdfFile = (id: string) =>
    downloadFile(`${baseUrl}/files/download-last/${id}`);

  const downloadPublishedRdfFile = (id: string) =>
    downloadFile(`${baseUrl}/files/download-published/${id}`);

  const previewRdfFile = (id: string) => {
    const token = useCookie("accessToken");
    if (!token) return;
    return useFetch(`${baseUrl}/files/preview-last/${id}`, {
      method: "get",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
  };

  const previewPublishedRdfFile = (id: string) => {
    const token = useCookie("accessToken");
    if (!token) return;
    return useFetch(`${baseUrl}/files/preview-published/${id}`, {
      method: "get",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
  };

  const updateRdfFile = (id: string, data: FormData) => {
    const token = useCookie("accessToken");
    if (!token) return;
    return useFetch(`${baseUrl}/files/update/${id}`, {
      method: "post",
      body: data,
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
  };

  return {
    provide: {
      createRdfDataFile,
      deleteRdfDataFile,
      downloadRdfFile,
      downloadPublishedRdfFile,
      previewRdfFile,
      previewPublishedRdfFile,
      updateRdfFile,
    },
  };
});
