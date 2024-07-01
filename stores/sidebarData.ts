import { useUserVocabulariesStore } from "./userVocabularies";
import type { Campaign } from "@/types/Campaign";
import type { Pagination } from "@/types/Pagination";
import type { Dataset, SchemeType } from "@/types/Dataset";
import type { Project } from "@/types/Project";
import type { DatasetSchema } from "@/types/schema/DatasetSchema";
import type { FetchState } from "~/types/fetch-state";
import type { WsMappingMessage, WsDatasetMessage } from "~/types/wsMessage";
import type { Index } from "~/types/Index";

export const useSidebarDataStore = defineStore("sidebarData", {
  state: () => ({
    fetchState: "idle" as FetchState,
    campaigns: [] as Campaign[],
    campaignPagination: {} as Pagination,
    catalogs: [] as Dataset[],
    catalogPagination: {} as Pagination,
    datasets: [] as Dataset[],
    datasetPagination: {} as Pagination,
    myProjects: [] as Project[],
    joinedProjects: [] as Project[],
    otherPublicProjects: [] as Project[],
    editDatasetClicked: false,
    editCampaignClicked: false,
    editSchemeClicked: false,
    editIndexClicked: false,
    editProjectClicked: false,
    schemePagination: {
      d2rml: {} as Pagination,
      shacl: {} as Pagination,
      annotator: {} as Pagination,
      comparator: {} as Pagination,
      index: {} as Pagination,
    },
    schemes: {
      d2rml: [] as Dataset[],
      shacl: [] as Dataset[],
      annotator: [] as Dataset[],
      comparator: [] as Dataset[],
      index: [] as Dataset[],
    },
    selectedProject: {} as Project,
    selectedDataset: {} as Dataset,
    selectedDatasetSchema: {} as DatasetSchema,
    selectedCampaign: {} as Campaign,
    selectedIndex: {} as Index,
    selectedScheme: {} as Dataset,
  }),

  actions: {
    async selectNewCampaign(id?: string) {
      const { $getCampaignWithDetailsById } = useNuxtApp();

      if (!id) {
        this.selectedCampaign = {} as Campaign;
        return;
      }

      this.fetchState = "pending";
      const { data, error }: any = await $getCampaignWithDetailsById(id);
      if (error.value) {
        this.fetchState = "error";
        throw new Error(error.value);
      } else {
        this.selectedCampaign = data.value.data;
        this.fetchState = "success";
      }
    },
    async fetchMyCampaigns(pageNumber?: number) {
      const { $getMyCampaigns } = useNuxtApp();

      this.fetchState = "pending";
      const { data, error }: any = await $getMyCampaigns(pageNumber);
      if (error.value) {
        this.fetchState = "error";
        throw new Error(error.value);
      } else {
        this.campaigns = data.value.data;
        this.campaignPagination = data.value.pagination;
        this.fetchState = "success";
      }
    },
    async fetchJoinedCampaigns(pageNumber?: number) {
      const { $getJoinedCampaigns } = useNuxtApp();

      this.fetchState = "pending";
      const { data, error }: any = await $getJoinedCampaigns(pageNumber);
      if (error.value) {
        this.fetchState = "error";
        throw new Error(error.value);
      } else {
        this.campaigns = data.value.data;
        this.campaignPagination = data.value.pagination;
        this.fetchState = "success";
      }
    },
    async selectNewDataset(id?: string) {
      const { $getDatasetWithDetailsById } = useNuxtApp();
      const { fetchAnnotationEditGroups } = useAnnotationsStore();
      const { fetchAnnotators } = useAnnotatorsStore();

      if (!id) {
        this.selectedDataset = {} as Dataset;
        fetchAnnotationEditGroups();
        fetchAnnotators();
        return;
      }

      this.fetchState = "pending";
      const { data, error }: any = await $getDatasetWithDetailsById(id);
      if (error.value) {
        this.fetchState = "error";
        throw new Error(error.value);
      } else {
        this.selectedDataset = data.value.data;
        this.fetchState = "success";
        fetchAnnotationEditGroups(id);
        fetchAnnotators(id);
      }
    },
    async updateMapping(mappingId: string, formData: FormData) {
      const { $mappingApi } = useNuxtApp();

      if (!this.selectedDataset?.mappings) {
        return;
      }
      const { data, error }: any = await $mappingApi.updateMapping(
        mappingId,
        formData
      );

      if (error.value) {
        throw new Error(error.value?.data?.message);
      } else {
        for (const [i, map] of this.selectedDataset.mappings.entries()) {
          if (map.id === mappingId) {
            this.selectedDataset.mappings[i] = data.value.data;
          }
        }
      }
    },
    mutateMapping(mapping: WsMappingMessage) {
      if (!this.selectedDataset?.mappings) {
        return;
      }
      for (const [i, map] of this.selectedDataset.mappings.entries()) {
        if (map.id === mapping.id) {
          for (const [j, instance] of map.instances.entries()) {
            if (instance.id === mapping.instanceId) {
              this.selectedDataset.mappings[i].instances[j] = {
                ...instance,
                executeState: {
                  ...instance.executeState,
                  ...(mapping.executeState || {}),
                },
                publishState: {
                  ...instance.publishState,
                  ...(mapping.publishState || {}),
                },
              };
              break;
            }
          }
        }
      }
    },
    async clearLastMappingExecution(mappingId: string, instanceId: string) {
      const { $mappingApi } = useNuxtApp();
      const { data, error }: any = await $mappingApi.clearLastExecution(
        mappingId,
        instanceId
      );
      if (error.value) {
        throw new Error(error);
      } else {
        if (!this.selectedDataset?.mappings) {
          return;
        }
        for (const [i, map] of this.selectedDataset.mappings.entries()) {
          if (map.id === mappingId) {
            this.selectedDataset.mappings[i] = data.value.data;
            break;
          }
        }
      }
    },
    mutateDataset(dataset: WsDatasetMessage) {
      if (!this.selectedDataset?.id || this.selectedDataset.id !== dataset.id) {
        return;
      }
      this.selectedDataset.publishState.state = dataset.state;
    },
    async getDatasetSchema(id: string) {
      const { $getDatasetSchema } = useNuxtApp();

      this.fetchState = "pending";
      const { data, error }: any = await $getDatasetSchema(id);
      if (error.value) {
        this.fetchState = "error";
        throw new Error(error.value);
      } else {
        this.selectedDatasetSchema = data.value.data[0];
        this.fetchState = "success";
      }
    },
    async selectNewScheme(id?: string, type?: string) {
      const { $getDatasetWithDetailsById, $getSchemeFiles } = useNuxtApp();
      if (!id || !type) {
        this.selectedScheme = {} as Dataset;
        return;
      }

      this.fetchState = "pending";
      const { data: schemeDetails, error }: any =
        await $getDatasetWithDetailsById(id);
      if (error.value) {
        this.fetchState = "error";
        throw new Error(error.value);
      } else {
        this.selectedScheme = schemeDetails.value.data;
        const { data: schemeFile, error }: any = await $getSchemeFiles(
          id,
          type
        );
        if (error.value) {
          console.error(error);
          this.fetchState = "error";
        } else {
          this.selectedScheme.files = schemeFile.value.data;
          this.fetchState = "success";
        }
      }
    },
    async fetchMyDatasets(pageNumber?: number) {
      const { $getMyDatasets } = useNuxtApp();
      const { fetchUserVocabularies } = useUserVocabulariesStore();

      this.fetchState = "pending";
      const { data, error }: any = await $getMyDatasets(pageNumber);
      if (error.value) {
        this.fetchState = "error";
        throw new Error(error.value);
      } else {
        this.datasets = data.value.data;
        this.datasetPagination = data.value.pagination;
        this.fetchState = "success";
      }

      // fetch user's vocabularies
      try {
        await fetchUserVocabularies();
      } catch (err: any) {
        throw new Error(err);
      }
    },
    async fetchMyCatalogs(pageNumber?: number) {
      const { $getMyCatalogs } = useNuxtApp();

      this.fetchState = "pending";
      const { data, error }: any = await $getMyCatalogs(pageNumber);
      if (error.value) {
        this.fetchState = "error";
        throw new Error(error.value);
      } else {
        this.catalogs = data.value.data;
        this.catalogPagination = data.value.pagination;
        this.fetchState = "success";
      }
    },
    async fetchMySchemes(type: SchemeType, page?: number) {
      const { $getMySchemes } = useNuxtApp();

      this.fetchState = "pending";
      const { data, error }: any = await $getMySchemes(type, page);
      if (error.value) {
        this.fetchState = "error";
        throw new Error(error.value);
      } else {
        this.schemes[type] = data.value.data;
        this.schemePagination[type] = data.value.pagination;
        this.fetchState = "success";
      }
    },
    async selectNewProject(id?: string) {
      const { $getProjectWithDetailsById } = useNuxtApp();

      if (!id) {
        this.selectedProject = {} as Project;
        return;
      }

      this.fetchState = "pending";
      const { data, error }: any = await $getProjectWithDetailsById(id);
      if (error.value) {
        this.fetchState = "error";
        throw new Error(error.value);
      } else {
        this.selectedProject = data.value.data;
        this.fetchState = "success";
      }
    },
    async fetchMyProjects(pageNumber?: number) {
      const { $getMyProjects } = useNuxtApp();

      this.fetchState = "pending";
      const { data, error }: any = await $getMyProjects(pageNumber);
      if (error.value) {
        this.fetchState = "error";
        throw new Error(error.value);
      } else {
        this.myProjects = data.value.data;
        this.fetchState = "success";
      }
    },
    async fetchJoinedProjects(pageNumber?: number) {
      const { $getJoinedProjects } = useNuxtApp();

      this.fetchState = "pending";
      const { data, error }: any = await $getJoinedProjects(pageNumber);
      if (error.value) {
        this.fetchState = "error";
        throw new Error(error.value);
      } else {
        this.joinedProjects = data.value.data;
        this.fetchState = "success";
      }
    },
    async fetchOtherPublicProjects(pageNumber?: number) {
      const { $getNotJoinedProjects } = useNuxtApp();

      this.fetchState = "pending";
      const { data, error }: any = await $getNotJoinedProjects(pageNumber);
      if (error.value) {
        this.fetchState = "error";
        throw new Error(error.value);
      } else {
        this.otherPublicProjects = data.value.data;
        this.fetchState = "success";
      }
    },
  },
});
