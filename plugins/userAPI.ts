export default defineNuxtPlugin(() => {
  const baseUrl = `${useRuntimeConfig().public.baseUrl}/users`;
  const token = useCookie("accessToken");
  const getHeader = () => {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${useCookie("accessToken").value}`,
    };
  };

  const registerUser = (name: string, email: string, password: string) => {
    return useFetch(`${baseUrl}/new`, {
      method: "post",
      body: {
        name,
        email,
        password,
      },
    });
  };
  const signinUser = (email: string, password: string) => {
    return useFetch(`${baseUrl}/signin`, {
      method: "post",
      body: {
        email,
        password,
      },
    });
  };
  const signinUserWithRole = (
    email: string,
    password: string,
    role: string
  ) => {
    return useFetch(`${baseUrl}/signin`, {
      method: "post",
      body: {
        email,
        password,
        role,
      },
    });
  };
  const signOutUser = () => {
    if (!token) throw new Error("User token not found");
    return useFetch(`${baseUrl}/signout`, {
      method: "post",
      headers: getHeader(),
    });
  };
  const retrievePassword = (email: string) => {
    return useFetch(`${baseUrl}/reset-password-request?email=${email}`, {
      method: "post",
    });
  };
  const resetPassword = (password: string, token: string | null) => {
    return useFetch(`${baseUrl}/save-password`, {
      method: "post",
      body: {
        newPassword: password,
        token,
      },
    });
  };
  const getCurrentUser = () => {
    if (!token) throw new Error("User token not found");
    return useFetch(`${baseUrl}/me`, {
      headers: getHeader(),
    });
  };
  const userUpdate = (body: object) => {
    if (!token) throw new Error("User token not found");
    return useFetch(`${baseUrl}/update`, {
      method: "post",
      body,
      headers: getHeader(),
    });
  };
  const getValidators = (page?: number) => {
    if (!token) throw new Error("User token not found");
    const getHeaders = () => {
      return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${useCookie("accessToken").value}`,
      };
    };
    const pageNum = page ? `&page=${page}&size=10` : "";
    return useFetch(`${baseUrl}/get-all?role=VALIDATOR${pageNum}`, {
      headers: getHeaders(),
    });
  };
  // User API endpoints
  return {
    provide: {
      registerUser: (name: string, email: string, password: string) =>
        registerUser(name, email, password),
      signinUser: (email: string, password: string) =>
        signinUser(email, password),
      signinUserWithRole: (email: string, password: string, role: string) =>
        signinUserWithRole(email, password, role),
      signOutUser: () => signOutUser(),
      retrievePassword: (email: string) => retrievePassword(email),
      resetPassword: (password: string, token: string | null) =>
        resetPassword(password, token),
      getCurrentUser: () => getCurrentUser(),
      getValidators: (page?: number) => getValidators(page),
      userUpdate: (body: object) => userUpdate(body),
    },
  };
});
