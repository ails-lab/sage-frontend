<template>
  <div :class="`dropdown ${classnames?.root || ''}`">
    <a
      :id="id"
      ref="dropdownRef"
      :class="`sage-icon ${classnames?.icon || ''}`"
      href="#"
      role="button"
      data-bs-toggle="dropdown"
      data-bs-auto-close="outside"
      aria-expanded="true"
    >
      <slot name="icon" />
    </a>
    <ul
      ref="dropdownListRef"
      :class="`dropdown-menu ${classnames?.menu || ''}`"
      :aria-labelledby="id"
    >
      <li v-for="(item, index) in items" :key="index">
        <template v-if="item.isDivider">
          <hr class="dropdown-divider" />
        </template>
        <template v-else>
          <a
            v-if="!item.isHidden"
            :class="`dropdown-item ${classnames?.item || ''} ${
              item.isDisabled ? 'disabled' : ''
            }`"
            :href="item.href"
            :data-bs-toggle="item.dataBsToggle"
            @click="handleClick(index)"
          >
            <i v-if="item.iconClass" :class="item.iconClass"></i>
            <span class="dropdown-text">
              {{ item.label }}
            </span>
          </a>
        </template>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import type { MenuDropdownProps } from "~/types/menu-dropdown.d.ts";

const props = defineProps<MenuDropdownProps>();

const dropdownListRef = ref<HTMLElement>();
const dropdownRef = ref<HTMLElement>();

const closeDropdown = () => {
  dropdownRef.value?.classList.remove("show");
  dropdownListRef.value?.classList.remove("show");
};

const handleClick = async (index: number) => {
  const item = props.items[index];
  if (item.isDisabled) {
    return;
  }
  if (!item.isDisabled && typeof item.onClick === "function") {
    await item?.onClick();
    closeDropdown();
  }
};
</script>
