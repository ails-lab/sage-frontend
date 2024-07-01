<template>
  <ul class="class-partition">
    <li class="class-partition-item">
      <div class="class-parition-item-header">
        <span>
          {{ classPartition.class }}
        </span>
        <div class="class-actionbar">
          <div class="class-actionbar-item">
            {{ classPartition.entities.toLocaleString("en-US") }}
          </div>
          <a
            ref="browseItemsIcon"
            class="class-actionbar-item circle action"
            href="#offcanvasBrowseItems"
            data-bs-toggle="offcanvas"
            role="button"
            aria-controls="offcanvasNewEmbedder"
            data-toggle="tooltip"
            :title="$t('dataset_schema.browse_items')"
            data-boundary="window"
            @click="emit('browseItems', props.classPartition.class)"
          >
            <i class="fa-regular fa-eye"></i>
          </a>
          <a
            v-if="classPartition.propertyPartition.length"
            :id="'toggle-cp-' + index"
            class="class-actionbar-item circle expand collapsed"
            href="#"
            data-bs-toggle="collapse"
            :data-bs-target="'#cp-' + index"
            aria-expanded="false"
          >
            <i class="down fa-solid fa-angle-down"></i>
            <i class="up fa-solid fa-angle-up"></i>
          </a>
        </div>
      </div>
      <ul
        :id="'cp-' + index"
        class="collapse schema-item property-partition-list"
        :data-bs-parent="'#toggle-cp-' + index"
      >
        <li
          v-for="(pp, propertyIndex) in classPartition.propertyPartition"
          :key="'property-partition-' + propertyIndex"
        >
          <PropertyPartition
            :property-partition="pp"
            :annotation-edit-group="annotationEditGroups?.[pp.property]"
            :annotators="annotatorsOfClass?.[pp.property]"
            @add-annotator="
              $emit('addAnnotator', {
                ...$event,
                onClass: classPartition.class,
              })
            "
            @view-values="
              $emit('viewValues', { ...$event, classUri: classPartition.class })
            "
          />
        </li>
      </ul>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { ClassPartition } from "@/types/schema/ClassPartition.d.ts";

const emit = defineEmits(["addAnnotator", "browseItems", "viewValues"]);

const props = defineProps<{
  classPartition: ClassPartition;
  index: number;
}>();

const { annotationsMappedOnProperties } = storeToRefs(useAnnotationsStore());
const { annotatorsMappedOnProperties } = storeToRefs(useAnnotatorsStore());

const annotationEditGroups = computed(
  () => annotationsMappedOnProperties.value[props.classPartition.class]
);

const annotatorsOfClass = computed(
  () => annotatorsMappedOnProperties.value[props.classPartition.class]
);

const { $bootstrap } = useNuxtApp();
const browseItemsIcon = ref(null);

onMounted(() => {
  new $bootstrap.Tooltip(browseItemsIcon.value!, { trigger: "hover" });
});
</script>

<style scoped lang="scss">
@import "@styles/mixin.scss";

.class-partition {
  padding-left: 5px;
  list-style: none;
  > li {
    padding-left: 0px;
    &:after,
    &:before {
      display: none;
    }
  }

  .class-parition-item-header {
    width: 100%;
    padding: 0px 7px 0px 40px;
    background-color: $accent-second-color;
    border: 1px solid $accent-second-color;
    color: #fff;
    border-radius: 20px;
    position: relative;
    @include clearfix();
    @include transition(all 0.2s);

    > span {
      display: inline-block;
      padding-top: 5px;
    }

    // display: inline-block;

    &::before {
      width: 8px;
      height: 8px;
      background-color: $accent-orange;
      border-radius: 4px;
      content: "";
      position: absolute;
      left: 20px;
      top: 15px;
    }

    // hover
    &:hover {
      background-color: $accent-second-color;
    }
  }
}

.property-partition-list {
  padding-left: 5px;
  > li {
    position: relative;
    list-style: none;
    padding-top: 5px;
    padding-left: 35px;
    margin-top: 5px;
    margin-bottom: 5px;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;

    &:before {
      width: 15px;
      height: 20px;
      border-bottom: 1px solid $accent-borderline;
      border-left: 1px solid $accent-borderline;
      border-radius: 0 0 0 10px;
      position: absolute;
      top: 6px;
      left: 20px;
      content: "";
    }

    &:after {
      position: absolute;
      top: -5px;
      bottom: 0;
      left: 20px;
      width: 1px;
      height: calc(100% + 25px);
      content: "";
      background-color: $accent-borderline;
    }

    &:last-child:after {
      height: 15px;
    }
  }
}

.class-actionbar {
  height: 40px;
  float: right;
  display: flex;
  align-items: center;
  gap: 3px;
  flex-wrap: nowrap;

  .class-actionbar-item {
    height: 25px;
    line-height: 24px;
    font-size: 12px;
    border-radius: 15px;
    border: 0px solid $accent-second-color;
    background-color: rgba(#fff, 0.2);
    padding: 0 10px;
  }

  .class-actionbar-item.circle {
    width: 25px;
    color: #fff;
    text-align: center;
    padding: 0;

    :deep(.dropdown-icon) {
      color: #fff;
      i {
        top: 0;
      }
    }

    &:hover {
      background-color: rgba(#fff, 0.4);
    }
    &:active {
      background-color: #fff;
      color: $accent-second-color;
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
</style>
