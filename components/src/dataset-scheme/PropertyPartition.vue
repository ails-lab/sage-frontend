<template>
  <div class="property-partition-header">
    <span>
      {{ propertyPartition.property }}
    </span>
    <div class="property-actionbar">
      <div class="property-actionbar-item">
        <span class="counter">
          <span class="distinct">
            {{ propertyPartition.distinctObjects.toLocaleString("en-US") }}
          </span>
          <span class="total">
            {{ propertyPartition.triples.toLocaleString("en-US") }}
          </span>
        </span>
      </div>
      <MenuDropdown
        :id="'dropdown-menu-more-item2'"
        :items="dropdownItems"
        :classnames="{
          root: 'property-actionbar-item circle',
          icon: 'dropdown-icon',
        }"
      >
        <template #icon> <i class="fa-solid fa-ellipsis"></i></template>
      </MenuDropdown>

      <a
        ref="addAnnotatorIcon"
        class="property-actionbar-item circle action"
        role="button"
        data-toggle="tooltip"
        :title="$t('dataset_schema.add_annotator')"
        @click="
          $emit('addAnnotator', {
            onProperty: propertyPartition.property,
          })
        "
      >
        <i class="fa-solid fa-plus"></i>
      </a>
    </div>
  </div>
  <div class="annotations-lists">
    <AnnotatorsList
      v-if="annotators"
      :annotators="annotators"
      :paged-validations="annotationEditGroup?.pagedAnnotationValidations"
    />
    <PublishedAnnotationsList
      v-if="annotationEditGroup?.published"
      :annotation-edit-group="annotationEditGroup"
      :property-name="propertyName"
    />
  </div>
</template>

<script setup lang="ts">
import type { PropertyPartition } from "@/types/schema/PropertyPartition.d.ts";
import type { AnnotationEditGroup } from "@/types/annotation-edit-group.d.ts";
import type { Annotator } from "~/types/Annotator";

const { t } = useI18n();
const emit = defineEmits(["addAnnotator", "viewValues"]);

const props = defineProps<{
  propertyPartition: PropertyPartition;
  annotationEditGroup?: AnnotationEditGroup;
  annotators?: Annotator[];
}>();

const propertyName = computed(() => {
  const onProperty = props.annotators?.[0].onProperty;
  if (!onProperty) {
    return;
  }

  let finalPropertyName = `${onProperty[0].prefix}:${onProperty[0].localName}`;
  finalPropertyName += ` / ${onProperty[1].prefix}:${onProperty[1].localName}`;

  return finalPropertyName;
});

const dropdownItems = computed(() => [
  {
    label: t("dataset_schema.view_values"),
    iconClass: "fa-regular fa-eye",
    href: "#offcanvasViewValues",
    dataBsToggle: "offcanvas",
    onClick: () => {
      emit("viewValues", { propertyUri: props.propertyPartition.property });
    },
  },
  {
    label: t("dataset_schema.download_values"),
    iconClass: "fa-solid fa-arrow-down",
  },
  {
    label: t("dataset_schema.add_annotator"),
    iconClass: "fa-solid fa-plus",
    onClick: () => {
      emit("addAnnotator", { onProperty: props.propertyPartition.property });
    },
  },
]);

const { $bootstrap } = useNuxtApp();
const addAnnotatorIcon = ref(null);

onMounted(() => {
  new $bootstrap.Tooltip(addAnnotatorIcon.value!, { trigger: "hover" });
});
</script>

<style scoped lang="scss">
@import "@styles/mixin.scss";

.property-partition-header {
  background-color: #fff;
  border: 1px solid $accent-second-color;
  color: $text-first-color;
  border-radius: 20px;
  padding: 0px 7px 0px 24px;
  @include clearfix();
  @include transition(all 0.2s);

  > span {
    display: inline-block;
    padding-top: 5px;
  }

  &:hover {
    background-color: rgba($accent-second-color, 10%);
  }
}

.property-actionbar {
  height: 40px;
  float: right;
  display: flex;
  align-items: center;
  gap: 3px;
  flex-wrap: nowrap;

  .property-actionbar-item {
    height: 25px;
    line-height: 24px;
    font-size: 12px;
    border-radius: 15px;
    border: 0px solid $accent-second-color;
    background-color: rgba(#fff, 0.2);

    .counter {
      .total,
      .distinct {
        display: inline-block;
        border: 1px solid $accent-second-color;
        font-size: 12px;
      }
      .total {
        border-radius: 0 15px 15px 0;
        padding: 0 10px 0 7px;
        background-color: #fff;
        color: $accent-second-color;
      }
      .distinct {
        border-radius: 15px 0 0 15px;
        padding: 0 7px 0 10px;
        position: relative;
        background-color: $accent-second-color;
        color: #fff;
      }
    }
  }

  .property-actionbar-item.circle {
    width: 25px;
    color: $accent-second-color;
    text-align: center;
    padding: 0;
    border: 1px solid $accent-second-color;

    :deep(.dropdown-icon) {
      :hover {
        color: #fff;
      }
      i {
        top: 0;
      }
    }

    &:hover {
      background-color: $text-second-color;
      color: #fff;
    }
    &:active {
      background-color: $accent-second-color;
      border-color: $accent-second-color;
    }
    &.expand {
      .down {
        display: none;
      }
    }
    &.collapsed {
      &.expand {
        .down {
          display: inline-block;
        }
        .up {
          display: none;
        }
      }
    }

    &.action {
      background-color: $accent-orange;
      border: 0;
      color: #fff;
      &:hover {
        background-color: darken($accent-orange, 5%);
      }
      &:active {
        background-color: darken($accent-orange, 10%);
      }
    }
  }
}

.annotations-lists {
  margin-top: 10px;
  margin-bottom: 5px;
}
</style>
