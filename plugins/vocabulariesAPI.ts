export default defineNuxtPlugin(() => {
  const baseUrl = `${useRuntimeConfig().public.baseUrl}/vocabularies`;

  const getAllVocabularies = () => {
    const token = useCookie("accessToken");
    return useFetch(`${baseUrl}/get-all`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    });
  };

  return {
    provide: {
      getAllVocabularies,
    },
  };
});
