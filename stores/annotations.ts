import type { AnnotationEditGroup } from "~/types/annotation-edit-group";
import type { FetchState } from "~/types/fetch-state";
import { WsValidationMessage } from "~/types/wsMessage";

export const useAnnotationsStore = defineStore("annotations", {
  state: () => ({
    fetchState: "idle" as FetchState,
    annotationEditGroups: [] as AnnotationEditGroup[],
  }),

  getters: {
    annotationsMappedOnProperties: (state) => {
      const groups: {
        [key: string]: { [key: string]: AnnotationEditGroup };
      } = {};
      state.annotationEditGroups?.forEach((group: any) => {
        if (group.onProperty?.length) {
          const propertyClass = onPropertyExtractClass(group.onProperty);
          if (!groups[propertyClass]) {
            groups[propertyClass] = {};
          }
          const propertyProperties = onPropertyExtractProperties(
            group.onProperty
          );
          propertyProperties.forEach((property: any) => {
            groups[propertyClass][property] = group;
          });
        }
      });
      return groups;
    },
  },
  actions: {
    async fetchAnnotationEditGroups(id?: string) {
      const { $getAnnotationEditGroups } = useNuxtApp();

      if (!id) {
        this.annotationEditGroups = [];
        return;
      }

      this.fetchState = "pending";
      const { data, error }: any = await $getAnnotationEditGroups(id);
      if (error.value) {
        this.fetchState = "error";
        throw new Error(error.value);
      } else {
        this.annotationEditGroups = data.value.data;
        this.fetchState = "success";
      }
    },

    async patchAnnotationEditGroup(
      aegId: string,
      body: Partial<AnnotationEditGroup>
    ) {
      const { $updateAnnotationEditGroup } = useNuxtApp();

      if (!aegId) {
        return;
      }

      const { data, error }: any = await $updateAnnotationEditGroup(
        aegId,
        body
      );
      if (error.value) {
        throw new Error(error.value);
      } else {
        this.annotationEditGroups = data.value.data;
      }
    },

    async exportAnnotationsValidations({
      aegId,
      options,
    }: {
      aegId: string;
      options: { [key: string]: string | boolean };
    }) {
      const { $exportAnnotationsValidations } = useNuxtApp();
      if (!aegId) {
        return;
      }

      const { error }: any = await $exportAnnotationsValidations(
        aegId,
        options
      );
      if (error.value) {
        throw new Error(error.value);
      }
    },

    copyExportAnnotationsLinkToClipboard({
      datasetUuid,
      options,
    }: {
      datasetUuid: string;
      options: { [key: string]: string | boolean };
    }) {
      if (!datasetUuid) {
        return;
      }
      const params = new URLSearchParams();
      Object.entries(options).forEach(([key, value]) => {
        params.append(key, value.toString());
      });
      const baseUrl = `${useRuntimeConfig().public.baseUrl}`;
      const link = `${baseUrl}/content/${datasetUuid}/task/export-annotations?${params.toString()}`;
      copyToClipboard(link);
    },

    async createPagedAnnotationValidation({
      aegId,
      body,
    }: {
      aegId: string;
      body: any;
    }) {
      const { $pavApi } = useNuxtApp();
      if (!aegId) {
        return;
      }

      const { error, data }: any = await $pavApi.create(aegId, body);
      if (error.value) {
        throw new Error(error);
      } else {
        const newPagedValidation = data.value.data;
        this.annotationEditGroups.forEach((group, index) => {
          if (group.id === aegId) {
            this.annotationEditGroups[index].pagedAnnotationValidations.push(
              newPagedValidation
            );
          }
        });
      }
    },

    async patchPagedAnnotationValidation({
      aegId,
      pavId,
      body,
    }: {
      aegId: string;
      pavId: string;
      body: any;
    }) {
      const { $pavApi } = useNuxtApp();
      if (!pavId || !aegId) {
        return;
      }

      const { error, data }: any = await $pavApi.update(pavId, body);
      if (error.value) {
        throw new Error(error);
      } else {
        const newPagedValidation = data.value.data;
        this.annotationEditGroups.forEach((group, index) => {
          if (group.id === aegId) {
            this.annotationEditGroups[index].pagedAnnotationValidations =
              this.annotationEditGroups[index].pagedAnnotationValidations.map(
                (pav) => (pav.id === pavId ? newPagedValidation : pav)
              );
          }
        });
      }
    },

    async deletePagedAnnotationValidation({
      aegId,
      pavId,
    }: {
      aegId: string;
      pavId: string;
    }) {
      const { $pavApi } = useNuxtApp();
      if (!pavId || !aegId) {
        return;
      }

      const { error }: any = await $pavApi.deletePav(pavId);
      if (error.value) {
        throw new Error(error);
      } else {
        this.annotationEditGroups.forEach((group, index) => {
          if (group.id === aegId) {
            this.annotationEditGroups[index].pagedAnnotationValidations =
              this.annotationEditGroups[
                index
              ].pagedAnnotationValidations.filter((pav) => pav.id !== pavId);
          }
        });
      }
    },

    async stopPagedAnnotationValidation({
      aegId,
      pavId,
    }: {
      aegId: string;
      pavId: string;
    }) {
      const { $pavApi } = useNuxtApp();
      if (!pavId) {
        return;
      }

      const { error, data }: any = await $pavApi.stopValidation(pavId);
      if (error.value) {
        throw new Error(error);
      } else {
        const newPagedValidation = data.value.data;
        this.annotationEditGroups.forEach((group, index) => {
          if (group.id === aegId) {
            this.annotationEditGroups[index].pagedAnnotationValidations =
              this.annotationEditGroups[index].pagedAnnotationValidations.map(
                (pav) => (pav.id === pavId ? newPagedValidation : pav)
              );
          }
        });
      }
    },

    mutatePagedValidationState(validation: WsValidationMessage) {
      const { id } = validation;
      for (let i = 0; i < this.annotationEditGroups.length; i++) {
        const group = this.annotationEditGroups[i];
        for (let j = 0; j < group.pagedAnnotationValidations.length; j++) {
          if (group.pagedAnnotationValidations[j].id === id) {
            const selectedPagedValidation = group.pagedAnnotationValidations[j];
            const executeState =
              validation.executeState || selectedPagedValidation.executeState;
            const publishState =
              validation.publishState || selectedPagedValidation.publishState;
            const lifecycleState =
              validation.lifecycleState ||
              selectedPagedValidation.lifecycleState;

            // mutate
            this.annotationEditGroups[i].pagedAnnotationValidations[j] = {
              ...this.annotationEditGroups[i].pagedAnnotationValidations[j],
              executeState,
              publishState,
              lifecycleState,
            };

            return;
          }
        }
      }
    },

    async createFilterValidation({
      aegId,
      body,
    }: {
      aegId: string;
      body: any;
    }) {
      const { $filterValApi } = useNuxtApp();

      if (!aegId) {
        return;
      }

      const { error, data }: any = await $filterValApi.create(aegId, body);
      if (error.value) {
        throw new Error(error);
      } else {
        const newFilterValidation = data.value.data;
        this.annotationEditGroups.forEach((group, index) => {
          if (group.id === aegId) {
            this.annotationEditGroups[index].filterAnnotationValidations.push(
              newFilterValidation
            );
          }
        });
      }
    },

    async patchFilterValidation({
      aegId,
      validationId,
      body,
    }: {
      aegId: string;
      validationId: string;
      body: any;
    }) {
      const { $filterValApi } = useNuxtApp();

      if (!validationId || !aegId) {
        return;
      }

      const { error, data }: any = await $filterValApi.update(
        validationId,
        body
      );
      if (error.value) {
        throw new Error(error);
      } else {
        const newFilterValidation = data.value.data;
        this.annotationEditGroups.forEach((group, index) => {
          if (group.id === aegId) {
            this.annotationEditGroups[index].filterAnnotationValidations =
              this.annotationEditGroups[index].filterAnnotationValidations.map(
                (filterVal) =>
                  filterVal.id === validationId
                    ? newFilterValidation
                    : filterVal
              );
          }
        });
      }
    },

    async deleteFilterValidation({
      aegId,
      validationId,
    }: {
      aegId: string;
      validationId: string;
    }) {
      const { $filterValApi } = useNuxtApp();

      if (!validationId || !aegId) {
        return;
      }

      const { error }: any = await $filterValApi.deleteFilterValidation(
        validationId
      );
      if (error.value) {
        throw new Error(error);
      } else {
        this.annotationEditGroups.forEach((group, index) => {
          if (group.id === aegId) {
            this.annotationEditGroups[index].filterAnnotationValidations =
              this.annotationEditGroups[
                index
              ].filterAnnotationValidations.filter(
                (filterVal) => filterVal.id !== validationId
              );
          }
        });
      }
    },

    mutateFilterValidationState(validation: WsValidationMessage) {
      const { id } = validation;
      for (let i = 0; i < this.annotationEditGroups.length; i++) {
        const group = this.annotationEditGroups[i];
        for (let j = 0; j < group.filterAnnotationValidations.length; j++) {
          if (group.filterAnnotationValidations[j].id === id) {
            const selectedFilterValidation =
              group.filterAnnotationValidations[j];
            const executeState =
              validation.executeState || selectedFilterValidation.executeState;
            const publishState =
              validation.publishState || selectedFilterValidation.publishState;

            // mutate
            this.annotationEditGroups[i].filterAnnotationValidations[j] = {
              ...this.annotationEditGroups[i].filterAnnotationValidations[j],
              executeState,
              publishState,
            };

            return;
          }
        }
      }
    },
  },
});
