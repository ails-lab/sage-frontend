<template>
  <ActionSidebar :id="`offcanvasNew${type}`" ref="schemeCanvas">
    <ActionSidebarHeader
      :title="`${
        !editSchemeClicked
          ? $t('new_scheme_sidebar.new')
          : $t('new_scheme_sidebar.edit')
      } ${type.toUpperCase()}`"
      :description="$t(propertyToken('description'))"
      :close-label="$t('cancel')"
      @close="closeCanvas"
    >
      <template #action>
        <ActionSidebarHeaderAction
          :aria-label="$t('save')"
          @click="saveScheme()"
        >
          {{ $t("save") }}
        </ActionSidebarHeaderAction>
      </template>
    </ActionSidebarHeader>
    <ActionSidebarBody>
      <div class="sage-form">
        <ActionFieldRow
          :label="$t('new_scheme_sidebar.name') + ' *'"
          :description="''"
        >
          <FormTextInput v-model="name" />
        </ActionFieldRow>
        <ActionFieldRow
          :label="$t('new_scheme_sidebar.identifier')"
          :description="$t('new_scheme_sidebar.identifier_description')"
        >
          <FormTextInput
            v-model="identifier"
            :error="identifierError?.message"
            @input="handleIdentifierChange"
          />
        </ActionFieldRow>
        <ActionFieldRow
          :label="$t('new_dataset_catalog_sidebar.visibility') + ' *'"
          :description="
            $t('new_dataset_catalog_sidebar.visibility_description')
          "
        >
          <FormSelectInput
            v-model="visibility"
            :options="[
              {
                value: 'private',
                label: $t('new_dataset_catalog_sidebar.private'),
              },
              {
                value: 'public',
                label: $t('new_dataset_catalog_sidebar.public'),
              },
            ]"
          />
        </ActionFieldRow>
        <div class="sage-form-info">
          <div class="notify">
            {{ $t("mandatory_field_explanation") }}
          </div>
        </div>
      </div>
    </ActionSidebarBody>
  </ActionSidebar>
</template>

<script setup lang="ts">
import { useIdentifierValidation } from "./composables/useIdentifierValidation";
import type { SchemeType } from "~/types/Dataset";

const { t } = useI18n();
const { toaster } = useToaster();

const { fetchMySchemes } = useSidebarDataStore();
const { $createNewScheme, $editScheme, $validateIdentifier } = useNuxtApp();

const { selectedScheme, editSchemeClicked } = storeToRefs(
  useSidebarDataStore()
);
const { selectNewScheme } = useSidebarDataStore();

const { identifierError, validateIdentifier } = useIdentifierValidation();

const props = defineProps<{ type: SchemeType }>();

const name = ref<string>("");
const identifier = ref<string>("");
const visibility = ref<string>("");
const schemeCanvas = ref();

const propertyToken = (property: String) => {
  return `new_scheme_sidebar.${props.type.toLowerCase()}_${property}`;
};

const handleIdentifierChange = debounce(() => {
  if (
    editSchemeClicked.value &&
    identifier.value === selectedScheme.value.identifier
  ) {
    identifierError.value = undefined;
    return;
  }
  validateIdentifier(
    $validateIdentifier,
    t("new_dataset_catalog_sidebar.identifier_error_exists"),
    t("new_dataset_catalog_sidebar.identifier_error_invalid"),
    identifier.value
  );
});

const resetInputValues = () => {
  name.value = "";
  identifier.value = "";
  visibility.value = "";
};

const closeCanvas = () => {
  resetInputValues();
  editSchemeClicked.value = false;
  hideOffcanvas(schemeCanvas);
};

const saveScheme = async () => {
  if (name.value === "" || visibility.value === "") {
    toaster.error(t("required_fields_error_msg"));
    return;
  }
  if (identifierError.value) {
    toaster.error(identifierError.value.message);
    return;
  }
  if (editSchemeClicked.value) {
    await updateScheme();
  } else {
    await createScheme();
  }
};

const createScheme = async () => {
  const { error }: any = await $createNewScheme(
    name.value,
    identifier.value,
    props.type.toUpperCase(),
    visibility.value === "public"
  );
  if (error.value) {
    toaster.error(error.value.data.message);
    return;
  }
  await fetchMySchemes(props.type, 1);
  editSchemeClicked.value = false;
  toaster.success(
    t("new_scheme_sidebar.create_scheme_success", { item: props.type })
  );
  closeCanvas();
};

const updateScheme = async () => {
  const { error }: any = await $editScheme(
    selectedScheme.value.id,
    name.value,
    identifier.value,
    props.type.toUpperCase(),
    visibility.value === "public"
  );
  if (error.value) {
    toaster.error(error.value.data.message);
    return;
  }
  selectNewScheme(selectedScheme.value.id, props.type).catch((error) =>
    console.error(error)
  );
  await fetchMySchemes(props.type, 1);
  editSchemeClicked.value = false;
  toaster.success(
    t("new_scheme_sidebar.update_scheme_success", { item: props.type })
  );
  closeCanvas();
};
watch(editSchemeClicked, () => {
  if (editSchemeClicked.value) {
    name.value = selectedScheme.value.name;
    identifier.value = selectedScheme.value.identifier ?? "";
    visibility.value = selectedScheme.value.public ? "public" : "private";
  }
});
</script>

<style scoped>
.error-paragraph {
  position: absolute;
  color: #f02849;
  font-size: 14px;
}
</style>
