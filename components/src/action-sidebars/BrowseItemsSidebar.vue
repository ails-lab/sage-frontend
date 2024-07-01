<template>
  <ActionSidebar id="offcanvasBrowseItems">
    <ActionSidebarHeader title="Items" @close="handleClose">
    </ActionSidebarHeader>
    <ActionSidebarBody>
      <div class="activity">
        <!-- listing-->
        <div ref="listEl" class="list-asset">
          <!-- entry -->
          <div v-for="(item, index) in itemList" :key="index" class="row entry">
            <!-- fol-->
            <div class="col-1">
              <span class="activity">
                <span class="activity-index">{{ index + 1 }}</span>
              </span>
            </div>

            <div class="col-9">
              <a
                :href="item.value.iri"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ item.value.iri }}
              </a>
            </div>
          </div>
          <div ref="lastItemEl" class="last-item"></div>
        </div>
        <h5 v-if="!itemList.length">
          {{ $t("view_values_sidebar.no_data_class") }}
        </h5>
      </div>
    </ActionSidebarBody>
  </ActionSidebar>
</template>

<script setup lang="ts">
const { $getDatasetSchemaClassItems } = useNuxtApp();
const { selectedDataset } = storeToRefs(useSidebarDataStore());

const emit = defineEmits(["close"]);
const props = defineProps({
  selectedUri: {
    type: String,
    required: true,
  },
});

const listEl = ref<HTMLElement | null>(null);
const lastItemEl = ref<HTMLElement | null>(null);
const itemList = ref<any[]>([]);

const { resetScroll, stopScroll } = useInfiniteScroll(
  listEl,
  lastItemEl,
  (page: number) => {
    getItems("ALL", page);
  },
  () => {
    itemList.value = [];
  }
);

watch(
  () => props.selectedUri,
  () => {
    if (props.selectedUri) {
      resetScroll();
    }
  }
);

const getItems = async (mode: string, page: number) => {
  const { data, error }: any = await $getDatasetSchemaClassItems(
    selectedDataset.value.id,
    mode,
    page,
    props.selectedUri
  );
  if (error.value) return;
  if (!data.value.data.length) stopScroll();
  itemList.value = [...itemList.value, ...data.value.data];
};

const handleClose = () => {
  stopScroll();
  emit("close");
};
</script>

<style scoped lang="scss">
span.activity {
  color: white;
  display: inline-block;
  width: 30px;
  height: 30px;
  background: #6ea543;
  border-radius: 15px;
  text-align: center;
  position: relative;
  .activity-index {
    position: relative;
    top: 1px;
  }
}
.list-asset::before {
  content: none !important;
}
</style>
