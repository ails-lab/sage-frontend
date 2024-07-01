<template>
  <ActionSidebar id="offcanvasActivity">
    <ActionSidebarHeader
      :title="$t('task_monitor.title')"
      :description="$t('task_monitor.description')"
    >
      <template #action>
        <ActionSidebarHeaderAction
          :aria-label="$t('task_monitor.refresh')"
          @click="refreshTaskMonitor"
        >
          <i class="fa-solid fa-rotate"></i>
          {{ $t("task_monitor.refresh") }}
        </ActionSidebarHeaderAction>
      </template>
    </ActionSidebarHeader>
    <ActionSidebarBody>
      <div class="activity">
        <!-- filter-->
        <div class="filter-section rightalign">
          <!-- filter-->
          <span class="stat">
            {{ tasks.length }} {{ $t("task_monitor.current_active_tasks") }}
          </span>
        </div>
        <!-- heading-->
        <div class="list-heading">
          <div class="row">
            <div class="col-1"></div>
            <div class="col-5 taskname">{{ $t("task_monitor.task") }}</div>
            <div class="col-3">{{ $t("task_monitor.type") }}</div>
            <div class="col elapsed-time">
              {{ $t("task_monitor.elapsed_time") }}
            </div>
            <div class="col"></div>
          </div>
        </div>
        <!-- listing-->
        <div class="list-asset">
          <template v-for="task of tasks" :key="task.id">
            <TaskRow
              :task="task"
              :is-child="false"
              :padding-left="-20"
              @refresh="refreshTaskMonitor"
            />
          </template>
        </div>
      </div>
    </ActionSidebarBody>
  </ActionSidebar>
</template>

<script setup lang="ts">
import type { Task } from "~/types/Task";

const { $getAllTasks } = useNuxtApp();

const tasks = ref<Task[]>([]);
onMounted(() => {
  getTasks();
});

const getTasks = async () => {
  const { data, error } = await $getAllTasks();
  if (error.value) console.error(error.value);
  tasks.value = data.value?.data;
};

const refreshTaskMonitor = () => {
  tasks.value = [];
  getTasks();
};
</script>

<style scoped>
.elapsed-time {
  text-align: center;
}
</style>
