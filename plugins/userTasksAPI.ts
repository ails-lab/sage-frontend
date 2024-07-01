export default defineNuxtPlugin(() => {
  const baseUrl = `${useRuntimeConfig().public.baseUrl}/user-tasks`;

  const createUserTask = (datasetId: string, body: {}) => {
    const token = useCookie("accessToken");
    if (!token) {
      return;
    }
    return useFetch(`${baseUrl}/new?datasetId=${datasetId}`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
      body,
    });
  };
  const updateUserTask = (id: string, body: {}) => {
    const token = useCookie("accessToken");
    if (!token) {
      return;
    }
    return useFetch(`${baseUrl}/update/${id}`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
      body,
    });
  };
  const scheduleUserTask = (id: string) => {
    const token = useCookie("accessToken");
    if (!token) {
      return;
    }
    return useFetch(`${baseUrl}/schedule/${id}`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    });
  };
  const unscheduleUserTask = (id: string) => {
    const token = useCookie("accessToken");
    if (!token) {
      return;
    }
    return useFetch(`${baseUrl}/unschedule/${id}`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    });
  };
  const runUserTask = (id: string) => {
    const token = useCookie("accessToken");
    if (!token) {
      return;
    }
    return useFetch(`${baseUrl}/run/${id}`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    });
  };
  const deleteUserTask = (id: string) => {
    const token = useCookie("accessToken");
    if (!token) {
      return;
    }
    return useFetch(`${baseUrl}/delete/${id}`, {
      method: "delete",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    });
  };
  // User Tasks API endpoints
  return {
    provide: {
      userTaskApi: {
        createUserTask,
        deleteUserTask,
        updateUserTask,
        runUserTask,
        scheduleUserTask,
        unscheduleUserTask,
      },
    },
  };
});
