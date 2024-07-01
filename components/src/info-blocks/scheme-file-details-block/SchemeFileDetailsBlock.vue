<template>
  <div class="asset">
    <div class="asset-header">
      <div class="row mapping-header">
        <div class="asset-header-info col-8">
          <h5>
            <span class="me-3">
              {{ file.name }}
            </span>
            <a @click="openSchemeDocument()">
              <i class="fa-solid fa-paperclip"></i>
            </a>
          </h5>
          <span v-if="file?.description" class="type">
            {{ file.description }}
          </span>
        </div>
        <div class="asset-header-status col-4">
          <MenuDropdown
            :id="'dropdown-menu-scheme-' + file.id"
            :items="schemeDropdownItems"
          >
            <template #icon>
              <i class="fa-solid fa-ellipsis"></i>
            </template>
          </MenuDropdown>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MenuDropdownItems } from "~/types/menu-dropdown";
import type { SchemeFile } from "~/types/SchemeFile";
const { selectNewScheme } = useSidebarDataStore();
const { selectedScheme } = storeToRefs(useSidebarDataStore());
const { selectSchemeFile } = useSelectedSchemeFile();
const { selectD2rml } = useSelectedD2rml();
const { $deleteSchemeFile } = useNuxtApp();
const { toaster } = useToaster();
const { showConfirmModal } = useModalsStore();
const { t } = useI18n();

const props = defineProps<{ file: SchemeFile }>();

const schemeType = computed(() => {
  return selectedScheme.value.scope.toLowerCase();
});

const schemeDropdownItems = computed<MenuDropdownItems>(() => [
  {
    label: t("scheme_item.actions.edit"),
    iconClass: "fa-regular fa-pen-to-square",
    onClick: handleEditSchemeFile,
    dataBsToggle: "offcanvas",
    href: `#offcanvasAdd${schemeType.value}File`,
  },
  {
    label: t("scheme_item.actions.delete"),
    iconClass: "fa-regular fa-trash-can",
    onClick: handleDeleteConfirmation,
  },
  {
    isDivider: true,
  },
  {
    label: t("scheme_item.actions.edit_document"),
    iconClass: "fa-solid fa-sliders",
    onClick: handleEditSchemeDocument,
    dataBsToggle: "offcanvas",
    href: "#offcanvasD2rml",
  },
]);

const handleEditSchemeFile = () => {
  selectSchemeFile(props.file);
};

const handleDeleteConfirmation = () => {
  showConfirmModal(
    t("scheme_item.delete_confirmation"),
    handleDeleteSchemeFile
  );
};

const handleDeleteSchemeFile = async () => {
  const { data, error }: any = await $deleteSchemeFile(props.file.id);
  if (error.value) {
    toaster.error(error.value.message);
  } else {
    toaster.success(data.value.message);
    await selectNewScheme(selectedScheme.value.id, selectedScheme.value.scope);
  }
};

const openSchemeDocument = () => {
  const url = `${useRuntimeConfig().public.baseUrl}/content/${
    selectedScheme.value.uuid
  }/prototype/${props.file.uuid}`;
  window.open(url, "_blank").focus();
};

const handleEditSchemeDocument = () => {
  selectSchemeFile(props.file);
  selectD2rml({ scheme: props.file, mode: "edit" });
};
</script>

<style scoped lang="scss">
@import "@styles/variables.scss";

.asset {
  margin-bottom: 12px !important;
}
.asset-header {
  color: $text-first-color !important;
  background-color: white !important;
  border: 1px solid $accent-second-color;
  border-radius: 5px !important;
  padding: 8px 12px !important;
  .asset-header-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    h5 {
      color: $text-first-color !important;
    }
    .type {
      color: $text-second-color !important;
      line-height: 18px;
      margin-top: 2px;
    }
  }
  .asset-header-status {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
}
.fa-ellipsis {
  color: $text-first-color;
  border: 1px solid $text-first-color;
  border-radius: 50%;
  padding: 8px;
  width: 30px;
  height: 30px;
  top: 0;
}
::v-deep ul.dropdown-menu.show {
  border: 1px solid rgba(255, 255, 255, 0.3);
}
</style>
