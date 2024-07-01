export const useModalsStore = defineStore("modals", {
  state: () => ({
    confirmModal: {
      message: "",
      onConfirm: () => {},
    },
  }),
  getters: {},

  actions: {
    showConfirmModal(message: string, onConfirm: (...args: any) => void) {
      const { $bootstrap } = useNuxtApp();
      this.confirmModal = {
        message,
        onConfirm,
      };
      const modal = new $bootstrap.Modal(
        document.getElementById("confirm-modal")
      );
      modal.show();
    },
  },
});
