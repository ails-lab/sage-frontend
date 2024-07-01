import { useAuthStore } from "@/stores/auth";
// set event on first stage
export const firstStageClicked = (
  e: Event,
  sidebarMenu: HTMLElement | null
) => {
  // remove default
  e.preventDefault();
  localStorage.sidebar = "first-stage";

  // set class on sidebar for first stage
  sidebarMenu?.classList.add("collapsed");
  sidebarMenu?.classList.add("first");

  // set event for expanding the collapsed sidebar
  sidebarMenu?.addEventListener("mouseover", function () {
    sidebarMenu?.classList.add("show");
  });
  sidebarMenu?.addEventListener("mouseout", function () {
    sidebarMenu?.classList.remove("show");
  });
};

// set event on second stage
export const secondStageClicked = (
  e: Event,
  sidebarMenu: HTMLElement | null
) => {
  const { currentUser } = storeToRefs(useAuthStore());

  // remove default
  e.preventDefault();
  localStorage.sidebar = "second-stage";

  // set the class
  sidebarMenu?.classList.remove("first");
  sidebarMenu?.classList.add("second");

  if (currentUser.value.role === "VALIDATOR") {
    sidebarMenu?.addEventListener("mouseover", function () {
      sidebarMenu?.classList.add("show");
    });
    sidebarMenu?.addEventListener("mouseout", function () {
      sidebarMenu?.classList.remove("show");
    });
  }
};

// set event on normal stage
export const normalStageClicked = (
  e: Event,
  sidebarMenu: HTMLElement | null
) => {
  const { currentUser } = storeToRefs(useAuthStore());
  // remove default
  e.preventDefault();
  localStorage.sidebar = "normal";

  // remove class
  sidebarMenu?.classList.remove("collapsed");
  sidebarMenu?.classList.remove("first");
  sidebarMenu?.classList.remove("second");
  sidebarMenu?.classList.remove("show");

  if (currentUser.value.role === "VALIDATOR") {
    sidebarMenu?.classList.add("collapsed");
    sidebarMenu?.classList.add("first");
  }

  // clear the event
  // sidebarMenu?.removeEventListener("mouseover", () => {});
  // sidebarMenu?.removeEventListener("mouseout", () => {});
};
