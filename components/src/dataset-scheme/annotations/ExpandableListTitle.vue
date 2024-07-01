<template>
  <div
    :class="`annotation-expandable-title ${
      variant === 'inverted' ? 'inverted' : ''
    }`"
  >
    <span class="title">{{ title }}</span>
    <a
      id="toggleAnnotationChild1"
      class="expand-icon-button expand collapsed"
      href="#"
      data-bs-toggle="collapse"
      :data-bs-target="'#' + dropdownTargetId"
      aria-expanded="false"
      aria-controls="flush-collapseOne"
    >
      <i class="down fa-solid fa-angle-down" aria-hidden="true"></i>
      <i class="up fa-solid fa-angle-up" aria-hidden="true"></i>
    </a>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  dropdownTargetId: string;
  variant?: "standard" | "inverted";
}>();
</script>

<style lang="scss" scoped>
@import "@styles/variables.scss";
.annotation-expandable-title {
  height: 40px;
  display: inline-block;
  width: 100%;
  padding: 0px 7px 0px 20px;
  background-color: $accent-orange;
  border: 1px solid $accent-orange;
  color: #fff;
  border-radius: 20px;

  span.title {
    display: inline-block;
    margin-top: 5px;
  }
  .expand-icon-button {
    width: 25px;
    height: 25px;
    margin-top: 7px;
    float: right;
    border-radius: 15px;
    border: 1px solid #0c325c;
    text-align: center;
    font-size: 12px;
    line-height: 25px;
    color: #fff;
    border-color: #fff;
    background: transparent;
    &:hover {
      background-color: rgba(#fff, 0.2);
    }
    &:active {
      background-color: rgba(#fff, 0.4);
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
  }

  &.inverted {
    background-color: rgba($accent-orange, 0.1);
    color: darken($accent-orange, 10%);
    margin-top: 10px;

    .expand-icon-button {
      color: darken($accent-orange, 10%);
      border-color: $accent-orange;
      &:hover {
        background-color: $accent-orange;
        color: #fff;
      }
      &:active {
        background-color: darken($accent-orange, 5%);
      }
    }
  }
}
</style>
