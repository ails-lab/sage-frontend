export default defineNuxtPlugin(() => {
  const baseUrl = `${useRuntimeConfig().public.baseUrl}/tasks`;

  const getAllTasks = () => {
    const token = useCookie("accessToken");
    return useFetch(`${baseUrl}/get-all`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    });
  };
  const stopTask = (id: string) => {
    const token = useCookie("accessToken");
    return useFetch(`${baseUrl}/stop/${id}`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    });
  };
  // current instance calls endpoints
  return {
    provide: {
      getAllTasks,
      stopTask,
    },
  };
});
