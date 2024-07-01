export default defineNuxtPlugin(() => {
  const baseUrl = `${useRuntimeConfig().public.baseUrl}/campaign`;

  const getCampaignWithDetailsById = (id: string) => {
    const token = useCookie("accessToken");
    const getHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    };
    if (!token) {
      return;
    }
    return useFetch(`${baseUrl}/get/${id}?details=true`, {
      method: "get",
      headers: getHeaders,
    });
  };
  const createCampaign = (name: string, state: string) => {
    const token = useCookie("accessToken");
    if (!token) {
      return;
    }
    return useFetch(`${baseUrl}/create`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
      body: {
        name,
        state,
        type: "ANNOTATION_VALIDATION",
      },
    });
  };
  const editCampaign = (id: string, name: string, state: string) => {
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
        state,
        type: "ANNOTATION_VALIDATION",
      },
    });
  };
  const getMyCampaigns = (page?: number) => {
    const token = useCookie("accessToken");
    if (!token) {
      return;
    }
    const pageNum = page ? `&page=${page}&size=10` : "";
    return useFetch(
      `${baseUrl}/get-all-my?type=ANNOTATION_VALIDATION${pageNum}`,
      {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );
  };
  const getJoinedCampaigns = (page?: number) => {
    const token = useCookie("accessToken");
    if (!token) {
      return;
    }
    const pageNum = page ? `&page=${page}&size=10` : "";
    return useFetch(
      `${baseUrl}/get-all-joined?type=ANNOTATION_VALIDATION${pageNum}`,
      {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );
  };
  const getActiveCampaigns = (page?: number) => {
    const token = useCookie("accessToken");
    if (!token) {
      return;
    }
    const pageNum = page ? `&page=${page}&size=10` : "";
    return useFetch(
      `${baseUrl}/get-all-active?type=ANNOTATION_VALIDATION${pageNum}`,
      {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );
  };
  const joinCampaign = (id: string) => {
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
  const deleteCampaign = (id: string) => {
    const token = useCookie("accessToken");
    const getHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    };
    if (!token) {
      return;
    }
    return useFetch(`${baseUrl}/delete/${id}`, {
      method: "delete",
      headers: getHeaders,
    });
  };
  const addDatasetToCampaign = (campaignId: string, datasetId: string) => {
    const token = useCookie("accessToken");
    const getHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    };
    if (!token) {
      return;
    }
    return useFetch(
      `${baseUrl}/add-dataset/${campaignId}?datasetId=${datasetId}`,
      {
        method: "post",
        headers: getHeaders,
      }
    );
  };
  const removeDatasetFromCampaign = (campaignId: string, datasetId: string) => {
    const token = useCookie("accessToken");
    const getHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    };
    if (!token) {
      return;
    }
    return useFetch(
      `${baseUrl}/remove-dataset/${campaignId}?datasetId=${datasetId}`,
      {
        method: "post",
        headers: getHeaders,
      }
    );
  };
  const addUserToCampaign = (campaignId: string, userId: string) => {
    const token = useCookie("accessToken");
    const getHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    };
    if (!token) {
      return;
    }
    return useFetch(`${baseUrl}/add-validator/${campaignId}?userId=${userId}`, {
      method: "post",
      headers: getHeaders,
    });
  };
  const removeUserFromCampaign = (campaignId: string, userId: string) => {
    const token = useCookie("accessToken");
    const getHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    };
    if (!token) {
      return;
    }
    return useFetch(`${baseUrl}/unjoin/${campaignId}?userId=${userId}`, {
      method: "post",
      headers: getHeaders,
    });
  };
  const getDatasetProgress = (campaignId: string, datasetId: string) => {
    const token = useCookie("accessToken");
    const getHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    };
    if (!token) {
      return;
    }
    return useFetch(
      `${baseUrl}/get-paged-annotation-validations/${campaignId}?datasetId=${datasetId}`,
      {
        method: "get",
        headers: getHeaders,
      }
    );
  };
  // Campaign API endpoints
  return {
    provide: {
      getCampaignWithDetailsById: (id: string) =>
        getCampaignWithDetailsById(id),
      deleteCampaign: (id: string) => deleteCampaign(id),
      createCampaign: (name: string, state: string) =>
        createCampaign(name, state),
      editCampaign: (id: string, name: string, state: string) =>
        editCampaign(id, name, state),
      getMyCampaigns: (page?: number) => getMyCampaigns(page),
      getActiveCampaigns: (page?: number) => getActiveCampaigns(page),
      getJoinedCampaigns: (page?: number) => getJoinedCampaigns(page),
      joinCampaign: (id: string) => joinCampaign(id),
      addDatasetToCampaign: (campaignId: string, datasetId: string) =>
        addDatasetToCampaign(campaignId, datasetId),
      removeDatasetFromCampaign: (campaignId: string, datasetId: string) =>
        removeDatasetFromCampaign(campaignId, datasetId),
      addUserToCampaign: (campaignId: string, datasetId: string) =>
        addUserToCampaign(campaignId, datasetId),
      removeUserFromCampaign: (campaignId: string, datasetId: string) =>
        removeUserFromCampaign(campaignId, datasetId),
      getDatasetProgress: (campaignId: string, datasetId: string) =>
        getDatasetProgress(campaignId, datasetId),
    },
  };
});
