type ToastType = "success" | "error" | "info";

type ToastState = {
  message: string;
  class: string;
  type: ToastType;
};

export const useToaster = () => {
  const state = useState<ToastState>("toast-state", () => ({
    message: "",
    class: "toast",
    type: "info",
  }));

  const isShown = computed(() => state.value.class.includes("show"));

  const showToast = (type: ToastType = "info", message: string) => {
    let typeClass = "normal";
    if (type === "error") {
      typeClass = "error";
    } else if (type === "success") {
      typeClass = "success";
    }
    state.value.type = type;
    state.value.message = message;
    state.value.class = `toast show ${typeClass}`;
  };
  const hideToast = () => {
    state.value.class = "toast";
    state.value.message = "";
  };

  const toaster = (message: string) => showToast("info", message);
  toaster.error = (message: string) => showToast("error", message);
  toaster.success = (message: string) => showToast("success", message);

  return { toaster, isShown, state, hideToast };
};
