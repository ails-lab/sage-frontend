<template>
  <ActionSidebar id="offcanvasViewValues">
    <ActionSidebarHeader title="Values" @close="handleClose">
    </ActionSidebarHeader>
    <ActionSidebarBody>
      <div class="activity">
        <div class="filter-section validation sticky-top view-values-filters">
          <div class="filter-section-metadata">
            <ul>
              <li>
                <div class="lbl">
                  {{ $t("view_values_sidebar.total_values") }}
                </div>
                <div class="value">
                  {{ metadata.totalCount }}
                </div>
              </li>
              <li>
                <div class="lbl">
                  {{ $t("view_values_sidebar.distinct_values") }}
                </div>
                <div class="value">
                  {{ metadata.distinctTotalCount }}
                </div>
              </li>
            </ul>
          </div>
          <ul class="filter-list">
            <li>
              <ul class="form-filter">
                <li :class="{ selected: filter === 'All' }">
                  <a @click="filterChanged('All')">
                    {{ $t("view_values_sidebar.all") }}
                  </a>
                </li>
                <li
                  :class="{
                    selected: filter === 'Literal',
                  }"
                >
                  <a @click="filterChanged('Literal')">
                    {{ $t("view_values_sidebar.literals") }}
                  </a>
                </li>
                <li
                  :class="{
                    selected: filter === 'Iri',
                  }"
                >
                  <a @click="filterChanged('Iri')">
                    {{ $t("view_values_sidebar.iris") }}
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
        <!-- listing-->
        <div class="list-heading">
          <div class="row">
            <div class="col-1"></div>
            <div class="col-9">
              {{
                filter === "All"
                  ? $t("view_values_sidebar.lexical_form_iri")
                  : filter === "Literal"
                  ? $t("view_values_sidebar.lexical_form")
                  : $t("view_values_sidebar.iri")
              }}
            </div>
            <div class="col-2">
              {{ $t("view_values_sidebar.count") }}
            </div>
          </div>
        </div>
        <div ref="listEl" class="list-asset">
          <!-- entry -->
          <div v-for="(item, index) in itemList" :key="index" class="row entry">
            <!-- fol-->
            <div class="col-1">
              <span class="activity">
                <span class="activity-index">{{ index + 1 }}</span>
              </span>
            </div>

            <div class="col-9 lexical">
              <a
                :href="item.value.datatype ?? item.value.iri"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ item.value.lexicalForm ?? item.value.iri }}
              </a>
            </div>
            <div class="col-2 count">
              <span>
                <span>{{ item.count }}</span>
              </span>
            </div>
          </div>
          <div ref="lastItemEl" class="last-item"></div>
        </div>
        <h5 v-if="!itemList.length">
          {{ $t("view_values_sidebar.no_data_property") }}
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
  classUri: {
    type: String,
    required: true,
  },
  propertyUri: {
    type: String,
    required: true,
  },
});

const metadata = ref<{ totalCount: number; distinctTotalCount: number }>({
  totalCount: 0,
  distinctTotalCount: 0,
});
const filter = ref<"All" | "Literal" | "Iri">("All");

const listEl = ref<HTMLElement | null>(null);
const lastItemEl = ref<HTMLElement | null>(null);
const itemList = ref<any[]>([]);

const { resetScroll, stopScroll } = useInfiniteScroll(
  listEl,
  lastItemEl,
  (page: number) => {
    getItems(filter.value.toUpperCase(), page);
  },
  (newFilter: "All" | "Literal" | "Iri") => {
    filter.value = newFilter;
    itemList.value = [];
  }
);

watch(
  () => props.classUri,
  () => {
    if (props.classUri) {
      resetScroll("All");
    }
  }
);

const getItems = async (mode: string, page: number) => {
  const { data, error }: any = await $getDatasetSchemaClassItems(
    selectedDataset.value.id,
    mode,
    page,
    props.classUri,
    props.propertyUri
  );
  if (error.value) return;
  if (!data.value.data.length) stopScroll();
  itemList.value = [...itemList.value, ...data.value.data];
  metadata.value = data.value.metadata;
};

const filterChanged = (selected: "All" | "Literal" | "Iri") => {
  if (filter.value === selected) return;
  resetScroll(selected);
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
.lexical {
  line-height: 16px;
}
.count {
  text-align: center;
}
.list-asset::before {
  content: none !important;
}
.sticky-top {
  padding: 20px 0;
}
</style>
