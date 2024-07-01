<template>
  <div class="row entry" :class="{ sub: props.isChild }">
    <div class="col-1 icon">
      <span class="activity">
        <img src="@images/ic-menu-lineactivity.svg" />
      </span>
    </div>
    <div
      class="col-5 taskname"
      :style="{ 'padding-left': props.paddingLeft + 'px' }"
      :title="props.task.description"
    >
      <i v-if="props.isChild" class="fa-solid fa-arrow-right" />
      {{ props.task.description }}
    </div>
    <div class="col-3">{{ props.task.type.split("_").join(" ") }}</div>
    <div class="col elapsed-time-col">
      {{ getElapsedTime(props.task.startTime, props.task.endTime) }}
    </div>
    <div class="col action">
      <ul>
        <li v-if="props.task.state === 'COMPLETED'">
          <a class="success"><i class="fa-solid fa-check"></i></a>
        </li>
        <li v-else-if="props.task.state === 'FAILED'">
          <a class="fail"><i class="fa-solid fa-xmark"></i></a>
        </li>
        <li v-else-if="props.task.stoppable">
          <a
            class="stop"
            @click="stopTask(props.task.id, props.task.description)"
          >
            <i class="fa-regular fa-square"></i>
          </a>
        </li>
      </ul>
    </div>
  </div>
  <template v-for="child of task.children" :key="child.id">
    <TaskRow
      :task="child"
      :is-child="true"
      :padding-left="props.paddingLeft + 20"
      @refresh="emit('refresh')"
    />
  </template>
</template>

<script setup lang="ts">
import type { Task } from "~/types/Task";
const { t } = useI18n();
const { toaster } = useToaster();

const { $stopTask } = useNuxtApp();

const props = defineProps<{
  task: Task;
  isChild: boolean;
  paddingLeft: number;
}>();

const emit = defineEmits(["refresh"]);

const stopTask = async (id: string, desc: string) => {
  const { error } = await $stopTask(id);
  if (error.value) {
    console.error(error.value);
    toaster.error(t("task_monitor.stop_failed", { item: desc }));
    return;
  }
  toaster.success(t("task_monitor.stop_success", { item: desc }));
  emit("refresh");
};

const getElapsedTime = (start: string, end: string | undefined) => {
  let endDate: Date;
  if (end) {
    endDate = new Date(end);
  } else endDate = new Date();
  const startDate = new Date(start);

  let difference = endDate.getTime() - startDate.getTime();

  difference = difference / 1000;
  const hourDifference = Math.floor(difference / 3600);
  difference -= hourDifference * 3600;
  const minuteDifference = Math.floor(difference / 60);
  difference -= minuteDifference * 60;
  return `${hourDifference < 10 ? "0" : ""}${hourDifference}:${
    minuteDifference < 10 ? "0" : ""
  }${minuteDifference}:${difference < 10 ? "0" : ""}${
    hourDifference === 0 && minuteDifference === 0 && difference < 1
      ? "1"
      : Math.floor(difference)
  }`;
};
</script>

<style lang="scss" scoped>
.child-task {
  padding-left: 15px;
}

.elapsed-time-col {
  text-align: center;
}
</style>
