<template>
  <div v-if="fetchState === 'error'">
    <NullResourceMessage type="scheme" />
  </div>
  <div v-else class="wrap">
    <div class="content">
      <ul class="nav nav-tabs featurenav" role="tablist">
        <li class="nav-item" role="presentation">
          <button
            id="scheme-tab"
            class="nav-link active"
            data-bs-toggle="tab"
            data-bs-target="#scheme"
            type="button"
            role="tab"
            aria-controls="scheme"
            aria-selected="true"
          >
            {{ $t(`scheme_page.header.${props.schemeType}`) }}
            <span class="counter">
              {{ schemeFiles?.length ?? 0 }}
            </span>
          </button>
        </li>
        <li class="nav-action">
          <a
            :href="`#offcanvasAdd${props.schemeType}File`"
            data-bs-toggle="offcanvas"
            role="button"
            :aria-controls="`#offcanvasAdd${props.schemeType}File`"
          >
            <i class="fa-solid fa-plus"></i>
            <span>
              {{ $t(`scheme_page.add.${props.schemeType}`) }}
            </span>
          </a>
        </li>
      </ul>
      <div id="schemeFilesTabContent" class="tab-content">
        <div
          id="scheme"
          class="tab-pane fade show active"
          role="tabpanel"
          aria-labelledby="scheme-tab"
        >
          <NoContentFound
            v-if="!schemeFiles.length"
            :text="$t(`sidebar_menu_scheme.description.${props.schemeType}`)"
            :action-h-ref="`#offcanvasAdd${props.schemeType}File`"
            :action-text="
              $t(`scheme_page.add.${props.schemeType}`) +
              ' ' +
              $t('scheme_page.now')
            "
          />
          <div v-else class="assetlist scheme-files">
            <li v-for="file of schemeFiles" :key="'scheme-file-' + file.id">
              <SchemeFileDetailsBlock :file="file" />
            </li>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { fetchState, selectedScheme } = storeToRefs(useSidebarDataStore());

const props = defineProps({
  schemeType: {
    type: String,
    required: true,
  },
});

const schemeFiles = computed(() => {
  return selectedScheme.value.files || [];
});
</script>

<style lang="scss" scoped>
.assetlist.scheme-files {
  overflow: auto;
  height: calc(100vh - 174px);
  width: 100%;
}
.content {
  padding: 0 30px !important;
}
.nav-link {
  cursor: default !important;
}
</style>
