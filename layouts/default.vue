<template>
  <main v-if="instance.label && currentUser" role="main">
    <!-- container-->
    <div class="container-fluid">
      <!-- info-->
      <div class="row page-wrapper">
        <div class="col nav-first">
          <div class="content">
            <!-- logo-->
            <NuxtLink to="/" @click="goHome()">
              <img class="logo" src="@images/ic-logo.svg" />
            </NuxtLink>
            <ul class="navigation app">
              <li
                v-if="currentUser.role === 'EDITOR'"
                ref="dataIcon"
                data-toggle="tooltip"
                title="Data"
                :class="{ selected: mainSidebarSelection == 'content' }"
              >
                <NuxtLink
                  to="/data/dataset"
                  @click="mainSidebarSelection = 'content'"
                >
                  <img src="@images/ic-menu-data.svg" />
                </NuxtLink>
              </li>
              <li
                v-if="currentUser.role === 'EDITOR'"
                ref="schemeIcon"
                data-toggle="tooltip"
                title="Scheme"
                :class="{ selected: mainSidebarSelection == 'scheme' }"
              >
                <NuxtLink
                  to="/scheme/d2rml"
                  @click="mainSidebarSelection = 'scheme'"
                >
                  <img src="@images/ic-menu-scheme.svg" />
                </NuxtLink>
              </li>
              <li
                v-if="['EDITOR', 'VALIDATOR'].includes(currentUser.role)"
                ref="campaignIcon"
                data-toggle="tooltip"
                title="Campaign"
                :class="{ selected: mainSidebarSelection == 'campaign' }"
              >
                <NuxtLink
                  to="/campaign"
                  @click="mainSidebarSelection = 'campaign'"
                >
                  <img src="@images/ic-menu-campaign.svg" />
                </NuxtLink>
              </li>
              <li
                v-if="currentUser.role === 'EDITOR'"
                ref="projectIcon"
                data-toggle="tooltip"
                title="Project"
                :class="{ selected: mainSidebarSelection == 'project' }"
              >
                <NuxtLink
                  to="/project/created"
                  @click="mainSidebarSelection = 'project'"
                >
                  <img src="@images/ic-menu-project.svg" />
                </NuxtLink>
              </li>
            </ul>
            <!-- help menu-->
            <ul class="navigation help">
              <li
                ref="documentationIcon"
                data-toggle="tooltip"
                title="Documentation"
              >
                <a
                  href="https://ails-lab.github.io/SAGE_Documentation/#/"
                  target="_blank"
                >
                  <img src="@images/ic-menu-help.svg" />
                </a>
              </li>
              <li
                v-if="currentUser.role === 'EDITOR'"
                ref="taskMonitorIcon"
                data-toggle="tooltip"
                title="Task Monitor"
              >
                <a
                  href="#offcanvasActivity"
                  data-bs-toggle="offcanvas"
                  role="button"
                  aria-controls="offcanvasActivity"
                >
                  <img src="@images/ic-menu-activity.svg" />
                </a>
              </li>
            </ul>
          </div>
        </div>
        <SidebarMenuAccount
          v-if="mainSidebarSelection == 'account'"
          :user="currentUser"
          :instance-name="instance.label"
          @logout="logOut"
        />
        <SidebarMenuContent
          v-if="mainSidebarSelection == 'content'"
          :instance-name="instance.label"
        />
        <SidebarMenuScheme
          v-if="mainSidebarSelection == 'scheme'"
          :instance-name="instance.label"
        />
        <SidebarMenuCampaign
          v-if="mainSidebarSelection == 'campaign'"
          :instance-name="instance.label"
        />
        <SidebarMenuProject
          v-if="mainSidebarSelection == 'project'"
          :instance-name="instance.label"
        />
        <div id="main" class="col nav-primary">
          <UserDropdown
            :user="currentUser"
            @go-to-account-clicked="goToAccount"
            @switch-role="switchRole"
            @logout="logOut"
          />
          <slot />
        </div>
        <!-- best viewed-->
        <div class="best-viewed">
          {{ $t("narrow_screen_disclaimer") }}
        </div>
      </div>
    </div>
  </main>
  <TaskMonitorSidebar v-if="currentUser.role !== 'VALIDATOR'" />
  <PageSpinner v-if="!instance.label || !currentUser" />
  <AlertModal
    :message="alertMessage"
    :report="alertReport"
    :timestamp="alertTimestamp"
    @okay="logOut()"
  />
  <SimpleToast />
  <ConfirmModal />
</template>

<script setup lang="ts">
// import the auth store we just created
import type { LoginMessage } from "@/types/wsMessage";

const { t } = useI18n();
const { toaster } = useToaster();
const { $bootstrap } = useNuxtApp();
const { logUserOut, fetchCurrentUser, authenticateUserWithRole } =
  useAuthStore(); // use authenticateUser action from  auth store
const { currentUser, errorRequest, errorMessage } = storeToRefs(useAuthStore()); // make authenticated state reactive with storeToRefs
const {
  fetchServices,
  fetchFunctions,
  fetchImportTemplates,
  fetchValidationModes,
  fetchIndexStructures,
  fetchInstance,
  fetchRdfVocabularies,
  fetchAllVocabularies,
} = useCurrentInstanceInfoStore();
const { instance } = storeToRefs(useCurrentInstanceInfoStore());
const {
  selectNewDataset,
  selectNewCampaign,
  selectNewScheme,
  selectNewProject,
} = useSidebarDataStore();
const {
  initializeWebsocket,
  closeWebsocket,
  readMessageFromChannel,
  loginChannelHistory,
} = useWebsocketStore();

const route = useRoute();
const mainSidebarSelection = ref<
  "scheme" | "campaign" | "content" | "account" | "project"
>(route.path.startsWith("/account") ? "account" : "campaign");
const alertMessage = ref<string>(t("account.signin.alert_multiple_sessions"));
const alertReport = ref<string>("");
const alertTimestamp = ref<string>("");
const dataIcon = ref(null);
const projectIcon = ref(null);
const schemeIcon = ref(null);
const campaignIcon = ref(null);
const taskMonitorIcon = ref(null);
const documentationIcon = ref(null);
const alertModal = ref();

const pageTitle = computed(() => {
  const pathNodes = route.path.split("/").slice(1);
  const title =
    pathNodes[0] === "data" || pathNodes[0] === "scheme"
      ? camelcaseString(pathNodes[1], "-")
      : camelcaseString(pathNodes[0], "-");
  return title.length ? `${title} | SAGE` : "SAGE";
});

useHead({
  title: pageTitle,
});

onMounted(async () => {
  alertModal.value = new $bootstrap.Modal(
    document.getElementById("alert-modal")
  );
  // It's necessary to wait for nextTick in order for the first API call of the queue to be executed correctly
  await nextTick();
  if (mainSidebarSelection.value !== "account" && !currentUser.value.id) {
    await fetchCurrentUser();
    if (errorRequest.value) {
      alertMessage.value = errorMessage.value;
      alertModal.value.show();
      return;
    }
  }
  // Set up menu-sidebar, based on the current path
  if (
    !route.path.startsWith("/account") &&
    currentUser.value.role === "EDITOR"
  ) {
    if (route.path.startsWith("/scheme")) mainSidebarSelection.value = "scheme";
    else if (route.path.startsWith("/campaign"))
      mainSidebarSelection.value = "campaign";
    else if (route.path.startsWith("/project"))
      mainSidebarSelection.value = "project";
    else mainSidebarSelection.value = "content";
  } else if (route.path.startsWith("/account")) {
    mainSidebarSelection.value = "account";
  }
  await fetchInstance();
  // No need for sequential order of API call execution, since there are no data correlation between them
  fetchServices();
  fetchFunctions();
  fetchImportTemplates();
  fetchValidationModes();
  fetchIndexStructures();
  fetchRdfVocabularies();
  fetchAllVocabularies();

  // Initialize web-socket
  try {
    initializeWebsocket();
  } catch (error) {
    toaster.error(error.message);
  }

  // Attach tooltips
  if (currentUser.value.role === "EDITOR") {
    new $bootstrap.Tooltip(dataIcon.value!, { trigger: "hover" });
    new $bootstrap.Tooltip(projectIcon.value!, { trigger: "hover" });
    new $bootstrap.Tooltip(schemeIcon.value!, { trigger: "hover" });
    new $bootstrap.Tooltip(taskMonitorIcon.value!, { trigger: "hover" });
  }
  new $bootstrap.Tooltip(campaignIcon.value!, { trigger: "hover" });
  new $bootstrap.Tooltip(documentationIcon.value!, { trigger: "hover" });
});

onBeforeUnmount(() => {
  closeWebsocket();
});

const goHome = () => {
  if (currentUser.value.role === "EDITOR") {
    mainSidebarSelection.value = "content";
    selectNewDataset();
  } else {
    mainSidebarSelection.value = "campaign";
    selectNewCampaign();
  }
  navigateTo("/");
};

const goToAccount = async () => {
  await navigateTo("/account");
  mainSidebarSelection.value = "account";
};

const switchRole = async (data: {
  email: string;
  pass: string;
  role: string;
}) => {
  await authenticateUserWithRole(data.email, data.pass, data.role);
  if (errorRequest.value) {
    toaster.error(t("navbar_user.wrong_password"));
    errorRequest.value = false;
    return;
  }
  await navigateTo("/");
  window.location.reload();
};

const logOut = async () => {
  await logUserOut();
  if (errorRequest.value) {
    console.error(errorMessage.value);
  }
};

watch(mainSidebarSelection, () => {
  selectNewDataset();
  selectNewCampaign();
  selectNewScheme();
  selectNewProject();
});

watch(loginChannelHistory, () => {
  const loginMessage: LoginMessage = readMessageFromChannel("login");
  if (loginMessage?.isNewLogin()) {
    alertReport.value = `New login detected`;
    alertTimestamp.value = loginMessage.issuedAt();
    alertModal.value.show();
  }
});

useWebsocketHandlers();
</script>

<style lang="scss">
@use "bootstrap/dist/css/bootstrap.min.css";
@use "~/assets/styles/main.scss";
@use "~/assets/styles/jquery-cron.scss";
@use "@fortawesome/fontawesome-free/css/all.min.css";

.page-wrapper {
  flex-wrap: nowrap;
  height: 100%;
}
</style>
