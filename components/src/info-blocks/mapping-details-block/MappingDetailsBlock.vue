<template>
  <div class="asset">
    <div class="asset-header">
      <div class="row mapping-header">
        <div class="asset-header-info col-8">
          <h5>
            {{ mapping.name }}
          </h5>
          <span v-if="mapping?.description" class="type">{{
            mapping.description
          }}</span>
        </div>
        <div class="asset-header-status col-4">
          <span class="asset-status">
            {{ mappingType }}
          </span>
        </div>
      </div>
    </div>
    <div class="asset-content">
      <div class="asset-content-status">
        <div class="row">
          <div class="content-status-info col-10">
            <ul>
              <li>
                <div class="lbl">
                  {{ $t("mapping_item.d2rml_document.label") }}
                </div>
                <div class="value">
                  <a
                    href="#offcanvasD2rml"
                    data-bs-toggle="offcanvas"
                    role="button"
                    aria-controls="offcanvasD2rml"
                    @click="handleOpenViewD2rml"
                  >
                    {{
                      mapping?.fileName
                        ? mapping.fileName
                        : $t("mapping_item.d2rml_document.open_link")
                    }}
                  </a>
                </div>
              </li>
              <li v-if="mappingIsParametric">
                <div class="lbl">
                  {{ $t("mapping_item.parameters") }}
                </div>
                <div class="value tag-pill-list">
                  <div
                    v-for="param of mapping.parameters"
                    :key="'param-' + param.name"
                    class="tag-pill"
                  >
                    {{ param.name }}
                  </div>
                </div>
              </li>
              <li v-if="mapping?.dataFiles" class="data-files">
                <div class="lbl">
                  {{ $t("mapping_item.data_files") }}
                </div>
                <div class="value tag-pill-list">
                  <div
                    v-for="fileName of mapping.dataFiles"
                    :key="'datafile-' + fileName"
                    class="tag-pill"
                  >
                    <a
                      @click="
                        downloadAttachment(
                          mapping.id,
                          fileName,
                          mapping.instances[0].id
                        )
                      "
                    >
                      {{ fileName }}</a
                    >
                    <a
                      @click="
                        showDeleteConfirmationModal(mapping.id, fileName, '')
                      "
                    >
                      <i class="fa-solid fa-xmark"></i>
                    </a>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div class="content-status-action col">
            <div class="actionbar">
              <ul>
                <li>
                  <MappingDropdownOptions
                    :mapping="props.mapping"
                    :scope="mappingScope"
                  />
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div v-if="!mappingIsParametric">
          <div class="row mapping-execute-state">
            <StateBlock
              type="execute"
              :state="mapping.instances[0].executeState"
            />
          </div>
          <div class="row mapping-publish-state">
            <StateBlock
              type="publish"
              :state="mapping.instances[0].publishState"
            />
          </div>
        </div>
        <div v-else>
          <div
            v-for="(instance, index) of mapping.instances"
            :key="mapping.id + '-' + index"
          >
            <div v-if="instance.binding?.length" class="row mapping-instance">
              <div class="mapping-header">
                {{ $t("mapping_item.mapping_instance") }}
              </div>
              <div class="col mapping-block">
                <div class="row instance-body">
                  <div class="content-status-info col-10 px-0">
                    <ul>
                      <li class="param-values">
                        <div class="lbl">
                          {{ $t("mapping_item.parameter_values") }}
                        </div>
                        <div class="value">
                          <p
                            v-for="binding of instance.binding.filter(
                              (bind) => bind.value
                            )"
                            :key="binding.value"
                            class="m-0"
                          >
                            <template v-if="!parameterIsHidden(binding.name)">
                              <span class="param-name">{{ binding.name }}</span>
                              <span class="param-value">{{
                                binding.value
                              }}</span>
                            </template>
                          </p>
                        </div>
                      </li>
                      <li v-if="instance.dataFiles" class="data-files">
                        <div class="lbl">
                          {{ $t("mapping_item.data_files") }}
                        </div>
                        <div class="value tag-pill-list">
                          <div
                            v-for="fileName of instance.dataFiles"
                            :key="'datafile-' + fileName"
                            class="tag-pill"
                          >
                            <a
                              @click="
                                downloadAttachment(
                                  mapping.id,
                                  fileName,
                                  instance.id
                                )
                              "
                            >
                              {{ fileName }}</a
                            >
                            <a
                              @click="
                                showDeleteConfirmationModal(
                                  mapping.id,
                                  fileName,
                                  instance.id
                                )
                              "
                            >
                              <i class="fa-solid fa-xmark"></i>
                            </a>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div class="instance-options col-2">
                    <MappingDropdownOptions
                      :mapping="mapping"
                      :instance="instance"
                      scope="instance"
                    />
                  </div>
                </div>
                <div class="row mapping-execute-state">
                  <StateBlock type="execute" :state="instance.executeState" />
                </div>
                <div class="row mapping-publish-state">
                  <StateBlock type="publish" :state="instance.publishState" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Mapping } from "@/types/Mapping";
import { useSidebarDataStore } from "~/stores/sidebarData";

const { selectNewDataset } = useSidebarDataStore();
const { selectedDataset } = storeToRefs(useSidebarDataStore());
const { $mappingApi } = useNuxtApp();
const { showConfirmModal } = useModalsStore();

const { t } = useI18n();
const { toaster } = useToaster();
const { selectD2rml } = useSelectedD2rml();

const props = defineProps<{ mapping: Mapping }>();

const attachmentToDelete = ref<{
  mappingId: string;
  filename: string;
  instanceId: string;
}>();

const handleOpenViewD2rml = () => {
  selectD2rml({ mapping: props.mapping, mode: "view" });
};

const mappingType = computed(() => {
  return props.mapping.type === "HEADER"
    ? t("catalog_page.metadata_mapping")
    : t("catalog_page.data_mapping");
});

const parameterIsHidden = (parameterName: string): boolean => {
  let name = parameterName;
  if (parameterName.endsWith("*")) {
    name = parameterName.substring(0, parameterName.length - 1);
  }
  return props.mapping.parameters.some(
    (param) => param.name === name && param.hidden
  );
};

const mappingIsParametric = computed(() => {
  return !!props.mapping.parameters;
});

const mappingScope = computed(() => {
  return props.mapping.parameters ? "parametric" : "flat";
});

const downloadAttachment = async (
  mappingId: string,
  filename: string,
  instanceId: string
) => {
  const { error } = await $mappingApi.downloadAttachment(
    mappingId,
    filename,
    instanceId
  );
  if (error.value) {
    toaster.error(t("error.while_downloading"));
    console.error(error.value);
  }
};

const showDeleteConfirmationModal = (
  mappingId: string,
  filename: string,
  instanceId: string
) => {
  attachmentToDelete.value = {
    mappingId,
    filename,
    instanceId,
  };
  showConfirmModal(
    t("confirm_delete_this_item", {
      itemToDelete: filename,
    }),
    deleteAttachment
  );
};

const deleteAttachment = async () => {
  if (attachmentToDelete.value) {
    const { error }: any = await $mappingApi.deleteAttachment(
      attachmentToDelete.value.mappingId,
      attachmentToDelete.value.filename,
      attachmentToDelete.value.instanceId
    );
    if (error.value) {
      toaster.error(
        t("error.while_deleting", {
          item: attachmentToDelete.value.filename,
        })
      );
    } else {
      toaster.success(
        t("success.while_deleting", { item: attachmentToDelete.value.filename })
      );
      selectNewDataset(selectedDataset.value?.id);
    }
    attachmentToDelete.value = undefined;
  }
};
</script>

<style scoped lang="scss">
@import "~/assets/styles/variables.scss";

.mapping-instance {
  margin-top: 8px;
  border: 1px $accent-bluegray-color solid;
  border-radius: 8px;
  background-color: $accent-third-color;
  .mapping-header {
    display: block;
    font-size: 12px;
    color: white;
    background-color: $accent-bluegray-color;
    margin-bottom: 8px;
    border-radius: 7px 7px 0 0;
  }
  .mapping-block {
    .param-values {
      .param-name {
        color: $accent-orange;
        margin-right: 8px;
        font-size: 13px;
      }
      .param-value {
        font-size: 12px;
        line-break: anywhere;
      }
    }
    .instance-body {
      display: flex;
      justify-content: space-between;
      padding-right: calc(var(--bs-gutter-x) * 0.5);
      padding-left: calc(var(--bs-gutter-x) * 0.5);
    }
    .instance-options {
      width: 28px;
      height: 28px;
      border: 1px solid #0c325c;
      border-radius: 17.5px;
      display: inline-flex;
      text-align: center;
      justify-content: center;
      color: #0c325c;
    }
  }
}

.data-files {
  .tag-pill {
    border-color: $text-third-color;
    color: $text-third-color;
    font-size: 10px;
    .fa-xmark {
      font-size: 14px;
      margin: 8px 0 0 8px;
      font-weight: bold;
    }
  }
}
.row {
  &.mapping-header {
    align-items: center;
  }
}
</style>
