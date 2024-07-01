import type { CurrentInstanceInfo } from "@/types/stores/CurrentInstanceInfo";
import type { ValidationMode } from "@/types/validation-mode.d.ts";

export const useCurrentInstanceInfoStore = defineStore("currentInstanceInfo", {
  state: (): CurrentInstanceInfo => ({
    services: {},
    functions: [],
    operations: [],
    datasetTemplates: [],
    mappingSampleTemplates: [],
    validationModes: [],
    validationModesDimensions: [],
    indexStructures: [],
    instance: {},
    rdfVocabularies: [],
    allVocabularies: [],
  }),

  getters: {},

  actions: {
    async fetchServices() {
      const { $getServices } = useNuxtApp();

      const { data, error }: any = await $getServices();
      if (data.value) this.services = data.value.data;
      if (error.value) console.error(error.value);
    },
    async fetchFunctions() {
      const { $getFunctions } = useNuxtApp();

      const { data, error }: any = await $getFunctions();
      if (data.value) {
        this.functions = data.value.data.functions;
        this.operations = data.value.data.operations;
      }
      if (error.value) console.error(error.value);
    },
    async fetchImportTemplates() {
      const { $getImportTemplates } = useNuxtApp();

      const { data, error }: any = await $getImportTemplates();
      if (data.value) {
        this.datasetTemplates = data.value.data?.datasetTemplates || [];
        this.mappingSampleTemplates =
          data.value.data?.mappingSampleTemplates || [];
      }
      if (error.value) console.error(error.value);
    },
    async fetchValidationModes() {
      const { $getValidationModes } = useNuxtApp();

      const { data, error }: any = await $getValidationModes();
      if (data.value) {
        this.validationModes = data.value.data;
        this.validationModesDimensions = Array.from(
          new Set(
            this.validationModes
              .map((mode: ValidationMode) =>
                mode.dimensions.map((d) => JSON.stringify(d))
              )
              .flat()
          )
        ).map((d) => JSON.parse(d));
      }
      if (error.value) console.error(error.value);
    },
    async fetchIndexStructures() {
      const { $getIndexStructures } = useNuxtApp();

      const { data, error }: any = await $getIndexStructures();
      if (data.value) this.indexStructures = data.value.data;
      if (error.value) console.error(error.value);
    },
    async fetchInstance() {
      const { $getInstance } = useNuxtApp();

      const { data, error }: any = await $getInstance();
      if (data.value) this.instance = data.value.data;
      if (error.value) console.error(error.value);
    },
    async fetchRdfVocabularies() {
      const { $getRdfVocabularies } = useNuxtApp();

      const { data, error }: any = await $getRdfVocabularies();
      if (data.value)
        this.rdfVocabularies = data.value.data.filter(
          (rdf: any) => rdf.properties
        );
      if (error.value) console.error(error.value);
    },
    async fetchAllVocabularies() {
      const { $getAllVocabularies } = useNuxtApp();

      const { data, error }: any = await $getAllVocabularies();
      if (data.value) {
        this.allVocabularies = data.value.data;
      }
      if (error?.value) {
        console.error(error?.value);
      }
    },
  },
});
