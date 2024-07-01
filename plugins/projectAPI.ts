export default defineNuxtPlugin(() => {
  const baseUrl = `${useRuntimeConfig().public.baseUrl}/project`;

  const getProjectWithDetailsById = (id?: string) => {
    const token = useCookie("accessToken");
    if (!token) {
      return;
    }

    return useFetch(`${baseUrl}/get/${id}?details=true`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    });
  };
  const getNotJoinedProjects = (page?: number) => {
    const token = useCookie("accessToken");
    if (!token) {
      return;
    }

    const pageNum = page ? `&page=${page}` : "";
    return useFetch(`${baseUrl}/get-all-other-public${pageNum}`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    });
  };
  const getMyProjects = (page?: number) => {
    const token = useCookie("accessToken");
    if (!token) {
      return;
    }

    // const pageNum = page ? `&page=${page}` : "";
    return useFetch(`${baseUrl}/get-all-my`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    });
  };
  const getJoinedProjects = (page?: number) => {
    const token = useCookie("accessToken");
    if (!token) {
      return;
    }

    // const pageNum = page ? `&page=${page}` : "";
    return useFetch(`${baseUrl}/get-all-joined`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    });
  };
  const createProject = (
    name: string,
    visibility: boolean,
    identifier: string
  ) => {
    const token = useCookie("accessToken");
    if (!token) {
      return;
    }
    return useFetch(`${baseUrl}/new`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
      body: {
        name,
        public: visibility,
        ...(identifier?.length ? { identifier } : {}),
      },
    });
  };
  const editProject = (
    id: string,
    name: string,
    visibility: boolean,
    identifier: string
  ) => {
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
      body: {
        name,
        public: visibility,
        ...(identifier?.length ? { identifier } : {}),
      },
    });
  };
  const joinProject = (id: string) => {
    const token = useCookie("accessToken");
    if (!token) {
      return;
    }
    return useFetch(`${baseUrl}/join/${id}`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    });
  };
  const validateProjectIdentifier = (identifier: string) => {
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
  return {
    provide: {
      createProject,
      editProject,
      validateProjectIdentifier,
      getNotJoinedProjects,
      joinProject,
      getJoinedProjects,
      getMyProjects,
      getProjectWithDetailsById,
    },
  };
});
