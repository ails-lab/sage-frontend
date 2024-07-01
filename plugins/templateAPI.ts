export default defineNuxtPlugin(() => {
  const baseUrl = `${useRuntimeConfig().public.baseUrl}/template`;

  const getTemplate = (id: string) => {
    const token = useCookie("accessToken");
    if (!token) return;
    return useFetch(`${baseUrl}/get/${id}`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    });
  };

  const createTemplate = (payload: object) => {
    const token = useCookie("accessToken");
    if (!token) return;
    return useFetch(`${baseUrl}/create`, {
      method: "post",
      body: payload,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    });
  };

  const deleteTemplate = (id: string) => {
    const token = useCookie("accessToken");
    if (!token) return;
    return useFetch(`${baseUrl}/delete/${id}`, {
      method: "delete",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    });
  };

  // API endpoints
  return {
    provide: {
      getTemplate: (id: string) => getTemplate(id),
      createTemplate: (payload: object) => createTemplate(payload),
      deleteTemplate: (id: string) => deleteTemplate(id),
    },
  };
});
