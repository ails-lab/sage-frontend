<template>
  <div :class="['col-1', 'icon', 'action', className]">
    <ul>
      <li class="add" :class="{ added: isAdded, removable: isToggleable }">
        <a @click="handleToggle" @mouseenter="handleMouseEnter()">
          <i class="plus fa-solid fa-plus"></i>
          <i class="check fa-solid fa-check"></i>
          <i class="remove fa-solid fa-xmark"></i>
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(["toggle"]);

const props = defineProps({
  className: {
    type: String,
    default: "",
  },
  isAdded: {
    type: Boolean,
    default: false,
  },
  isRemovable: {
    type: Boolean,
    default: true,
  },
});

const isToggleable = ref(false);

const handleMouseEnter = () => {
  isToggleable.value = props.isAdded && props.isRemovable;
};

const handleToggle = (e: MouseEvent) => {
  if (!(props.isAdded && !isToggleable.value)) {
    emit("toggle", e);
    handleMouseEnter();
  }
};
</script>
