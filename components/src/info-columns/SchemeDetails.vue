<template>
  <div class="col nav-third">
    <div class="content">
      <div class="wrap">
        <!-- information-->
        <div class="info-detail">
          <!-- selected title-->
          <h2>{{ selectedScheme.name }}</h2>
          <span class="type">
            {{ $t(`sidebar_menu_scheme.scheme_types.${props.type}`) }}
          </span>
        </div>
        <!-- selected action-->
        <div class="actionbar">
          <ul>
            <li>
              <a
                ref="editIcon"
                class="sage-icon"
                :href="`#offcanvasNew${props.type}`"
                data-bs-toggle="offcanvas"
                role="button"
                :aria-controls="`offcanvasNew${props.type}`"
                data-toggle="tooltip"
                :title="`Edit ${props.type}`"
                data-boundary="window"
                @click="editClicked"
                ><i class="edit"></i
              ></a>
            </li>
            <li>
              <a
                ref="deleteIcon"
                class="sage-icon"
                data-toggle="tooltip"
                :title="`Delete ${props.type}`"
                data-boundary="window"
                @click="showDeleteConfirmationModal"
                ><i class="delete"></i
              ></a>
            </li>
            <li>
              <a
                ref="addSchemeToProjectIcon"
                role="button"
                class="sage-icon"
                data-toggle="tooltip"
                :title="`Add ${camelcaseString(props.type)} to Project`"
                data-boundary="window"
              >
                <i class="folder"></i>
              </a>
            </li>
          </ul>
        </div>
        <!-- metadata-->
        <div class="info-meta">
          <!-- field-->
          <div class="field">
            <div class="title">UUID</div>
            <div class="value">{{ selectedScheme.uuid }}</div>
          </div>
        </div>
        <div class="info-meta">
          <!-- field-->
          <div class="field">
            <div class="title">Identifier</div>
            <div class="value">
              {{
                selectedScheme.identifier ? selectedScheme.identifier : "N/A"
              }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useSidebarDataStore } from "~/stores/sidebarData";
import type { Dataset } from "@/types/Dataset";

const { t } = useI18n();
const { showConfirmModal } = useModalsStore();
const { fetchMySchemes } = useSidebarDataStore();
const { selectedScheme, editSchemeClicked } = storeToRefs(
  useSidebarDataStore()
);

const props = defineProps({
  type: {
    type: String,
    required: true,
  },
});

const { $bootstrap } = useNuxtApp();

const deleteIcon = ref(null);
const editIcon = ref(null);
const addSchemeToProjectIcon = ref(null);

onMounted(() => {
  new $bootstrap.Tooltip(editIcon.value, { trigger: "hover" });
  new $bootstrap.Tooltip(deleteIcon.value, { trigger: "hover" });
  new $bootstrap.Tooltip(addSchemeToProjectIcon.value, { trigger: "hover" });
});

const editClicked = () => {
  const offcanvasNewShacl = document.getElementById("offcanvasNewShacl");
  const offcanvasNewD2RML = document.getElementById("offcanvasNewD2RML");
  if (
    offcanvasNewShacl?.classList.contains("show") ||
    offcanvasNewD2RML?.classList.contains("show")
  ) {
    editSchemeClicked.value = false;
  } else {
    editSchemeClicked.value = true;
  }
};

const showDeleteConfirmationModal = () => {
  showConfirmModal(
    t("confirm_delete_this_item", { itemToDelete: props.type }),
    deleteScheme
  );
};

const deleteScheme = async () => {
  const { $deleteDataset } = useNuxtApp();
  const { error } = await $deleteDataset(selectedScheme.value.id);
  if (error.value) {
    console.error(error.value.message);
    return;
  }
  await navigateTo(`/scheme/${props.type?.toLowerCase()}`);
  await fetchMySchemes(props.type, 1);
  selectedScheme.value = {} as Dataset;
};
</script>
