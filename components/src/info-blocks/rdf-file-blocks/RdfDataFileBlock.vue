<template>
  <div class="asset">
    <div class="asset-header">
      <div class="row">
        <div class="asset-header-info col-8">
          <h5>
            {{ rdfFile.name }}
          </h5>
          <span v-if="rdfFile?.description" class="type">{{
            rdfFile.description
          }}</span>
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
                  {{ $t("rdf_item.rdf_data_file.label") }}
                </div>
                <div class="value">
                  <a
                    :href="
                      !rdfFileName.endsWith('.zip')
                        ? '#offcanvasRdf'
                        : undefined
                    "
                    data-bs-toggle="offcanvas"
                    role="button"
                    aria-controls="offcanvasRdf"
                    :class="[rdfFileName.endsWith('.zip') && 'no-link']"
                    @click="handleViewRdf"
                  >
                    {{ rdfFileName || $t("rdf_item.rdf_data_file.open_link") }}
                  </a>
                </div>
              </li>
            </ul>
          </div>
          <div class="content-status-action col">
            <div class="actionbar">
              <ul>
                <li>
                  <RdfFileDropdownOptions
                    :rdf-file="props.rdfFile"
                    @edit="handleEdit"
                    @preview-rdf="handleViewRdf"
                    @preview-published-rdf="handleViewPublishedRdf"
                  />
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="row mapping-execute-state">
            <StateBlock type="execute" :state="rdfFile.executeState" />
          </div>
          <div class="row mapping-publish-state">
            <StateBlock type="publish" :state="rdfFile.publishState" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RdfDataFileProp } from "@/types/RdfDataFile";
const emit = defineEmits(["openRdfDocument", "edit"]);

const props = defineProps({
  rdfFile: {
    type: RdfDataFileProp,
    required: true,
  },
});

const rdfFileName = computed(() => props.rdfFile?.executeState?.fileName);

const handleViewRdf = () => {
  if (rdfFileName.value?.endsWith(".zip")) {
    return;
  }
  emit("openRdfDocument", false, props.rdfFile);
};

const handleViewPublishedRdf = () => {
  if (rdfFileName.value?.endsWith(".zip")) {
    return;
  }
  emit("openRdfDocument", true, props.rdfFile);
};

const handleEdit = () => {
  emit("edit", props.rdfFile);
};
</script>

<style scoped lang="scss">
.no-link {
  cursor: unset;
  text-decoration: none !important;
}
</style>
