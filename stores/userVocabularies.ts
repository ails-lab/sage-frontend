import type { UserVocabulary } from "~/types/Vocabulary";
import type { FetchState } from "~/types/fetch-state";

export const useUserVocabulariesStore = defineStore("userVocabularies", {
  state: () => ({
    fetchState: "idle" as FetchState,
    userVocabularies: [] as UserVocabulary[],
  }),
  getters: {
    publishedVocabularies: (state) =>
      state.userVocabularies.filter((vocabulary) => vocabulary.public),
  },
  actions: {
    async fetchUserVocabularies() {
      const { $getMyVocabularies } = useNuxtApp();

      this.fetchState = "pending";
      const { data, error }: any = await $getMyVocabularies();
      if (error.value) {
        this.fetchState = "error";
        throw new Error(error.value.message);
      } else {
        this.userVocabularies = data.value.data;
        this.fetchState = "success";
      }
    },
  },
});
