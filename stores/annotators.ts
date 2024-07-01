import type { Annotator } from "~/types/Annotator";
import type { FetchState } from "~/types/fetch-state";
import { WsAnnotatorMessage } from "~/types/wsMessage";

export const useAnnotatorsStore = defineStore("annotators", {
  state: () => ({
    fetchState: "idle" as FetchState,
    annotators: [] as Annotator[],
  }),
  getters: {
    annotatorsMappedOnProperties: (state) => {
      const groups: {
        [key: string]: { [key: string]: Annotator[] };
      } = {};
      state.annotators?.forEach((annotator) => {
        if (annotator.onProperty?.length) {
          const propertyClass = onPropertyExtractClass(annotator.onProperty);
          if (!groups[propertyClass]) {
            groups[propertyClass] = {};
          }
          const propertyProperties = onPropertyExtractProperties(
            annotator.onProperty
          );
          propertyProperties.forEach((property: any) => {
            if (!groups[propertyClass][property]) {
              groups[propertyClass][property] = [annotator];
            } else {
              groups[propertyClass][property].push(annotator);
            }
          });
        }
      });
      return groups;
    },
  },
  actions: {
    emptyAnnotators() {
      this.annotators = [];
      this.fetchState = "idle";
    },

    async fetchAnnotators(datasetId?: string) {
      const { $annotatorApi } = useNuxtApp();

      if (!datasetId) {
        this.emptyAnnotators();
        return;
      }

      this.fetchState = "pending";
      const { data, error }: any = await $annotatorApi.fetchAll(datasetId);
      if (error.value) {
        this.fetchState = "error";
        throw new Error(error.value.message);
      } else {
        this.annotators = data.value.data;
        this.fetchState = "success";
      }
    },
    async createAnnotator(datasetId: string, body: object) {
      const { $annotatorApi } = useNuxtApp();

      const { error, data }: any = await $annotatorApi.create(datasetId, body);
      if (error.value) {
        throw new Error(error.value.message);
      } else {
        this.annotators.push(data.value.data);
      }
    },
    async updateAnnotator(annotatorId: string, body: object) {
      const { $annotatorApi } = useNuxtApp();

      const { error, data }: any = await $annotatorApi.update(
        annotatorId,
        body
      );
      if (error.value) {
        throw new Error(error.value.message);
      } else {
        const annotator = data.value.data;
        const index = this.annotators.findIndex((a) => a.id === annotator.id);
        if (index !== -1) {
          this.annotators[index] = annotator;
        }
      }
    },
    async deleteAnnotator(annotatorId: string) {
      const { $annotatorApi } = useNuxtApp();

      const { error } = await $annotatorApi.deleteAnnotator(annotatorId);
      if (error.value) {
        throw new Error(error.value.message);
      } else {
        const index = this.annotators.findIndex((a) => a.id === annotatorId);
        if (index !== -1) {
          this.annotators.splice(index, 1);
        }
      }
    },
    async prepare(annotatorId: string) {
      const { $annotatorApi } = useNuxtApp();
      const { toaster } = useToaster();

      const { error, data }: any = await $annotatorApi.prepare(annotatorId);
      if (error.value) {
        toaster.error(error.value.message);
      } else {
        toaster.success(data.value.message);
      }
    },

    async execute(annotatorId: string) {
      const { $annotatorApi } = useNuxtApp();

      const { error }: any = await $annotatorApi.execute(annotatorId);
      if (error.value) {
        throw new Error(error.value.message);
      }
    },

    async stopExecution(annotatorId: string) {
      const { $annotatorApi } = useNuxtApp();

      const { error }: any = await $annotatorApi.stopExecution(annotatorId);
      if (error.value) {
        throw new Error(error.value.message);
      }
    },

    async publish(annotatorId: string) {
      const { $annotatorApi } = useNuxtApp();

      const { error }: any = await $annotatorApi.publish(annotatorId);
      if (error.value) {
        throw new Error(error.value.message);
      }
    },

    async republish(annotatorId: string) {
      const { $annotatorApi } = useNuxtApp();

      const { error }: any = await $annotatorApi.republish(annotatorId);
      if (error.value) {
        throw new Error(error.value.message);
      }
    },

    async unpublish(annotatorId: string) {
      const { $annotatorApi } = useNuxtApp();

      const { error }: any = await $annotatorApi.unpublish(annotatorId);
      if (error.value) {
        throw new Error(error.value.message);
      }
    },

    async previewLastExecution(annotatorId: string) {
      const { $annotatorApi } = useNuxtApp();

      const { error }: any = await $annotatorApi.previewLastExecution(
        annotatorId
      );
      if (error.value) {
        throw new Error(error.value.message);
      }
    },

    async downloadLastExecution(annotatorId: string) {
      const { $annotatorApi } = useNuxtApp();

      const { error }: any = await $annotatorApi.downloadLastExecution(
        annotatorId
      );
      if (error.value) {
        throw new Error(error.value.message);
      }
    },

    async clearLastExecution(annotatorId: string) {
      const { $annotatorApi } = useNuxtApp();

      const { error }: any = await $annotatorApi.clearLastExecution(
        annotatorId
      );
      if (error.value) {
        throw new Error(error.value.message);
      }
    },

    async previewPublishedExecution(annotatorId: string) {
      const { $annotatorApi } = useNuxtApp();

      const { error }: any = await $annotatorApi.previewPublishedExecution(
        annotatorId
      );
      if (error.value) {
        throw new Error(error.value.message);
      }
    },
    async downloadPublishedExecution(annotatorId: string) {
      const { $annotatorApi } = useNuxtApp();

      const { error }: any = await $annotatorApi.downloadPublishedExecution(
        annotatorId
      );
      if (error.value) {
        throw new Error(error.value.message);
      }
    },
    mutateAnnotatorState(annotator: WsAnnotatorMessage) {
      const index = this.annotators.findIndex((a) => a.id === annotator.id);
      if (index !== -1) {
        if (annotator.publishState) {
          this.annotators[index].publishState = annotator.publishState;
        }
        if (annotator.executeState) {
          this.annotators[index].executeState = annotator.executeState;
        }
      }
    },
  },
});
