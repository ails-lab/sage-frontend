<template>
  <!-- asset-->
  <div class="asset">
    <!-- header-->
    <div class="asset-header">
      <!-- row-->
      <div class="row">
        <!-- info-->
        <div class="asset-header-info col-8">
          <h5>{{ props.userTask.name }}</h5>
          <span class="type">{{ $t("dataset_page.user_task") }}</span>
        </div>
        <!-- status-->
        <div
          v-if="props.userTask.runState?.state"
          class="asset-header-status col-4"
        >
          <div class="asset-status warning">
            {{ removeUnderscore(props.userTask.runState?.state) }}
          </div>
        </div>
      </div>
    </div>
    <!-- body-->
    <div class="asset-content">
      <!-- row-->
      <div class="asset-content-status">
        <!-- row-->
        <div class="row">
          <!-- asset status-->
          <div class="content-status-info col-10">
            <ul>
              <li class="execution-status">
                <div class="lbl">{{ $t("user_task_item.state") }}</div>
                <div class="value">
                  <a
                    v-if="props.userTask.runState?.state"
                    id="toggleMetadata"
                    class="toggle single collapsed"
                    :class="{
                      warning: props.userTask.runState?.state === 'NOT_RUNNING',
                    }"
                    href="#"
                    data-bs-toggle="collapse"
                    data-bs-target="#asset-metadata"
                    aria-expanded="false"
                    aria-controls="flush-collapseOne"
                  >
                    <div class="txt">
                      {{ removeUnderscore(props.userTask.runState?.state) }}
                    </div></a
                  >
                </div>
              </li>
              <li>
                <div class="lbl">{{ $t("user_task_item.state") }}</div>
                <div
                  v-for="(task, index) of props.userTask.tasks"
                  :key="props.userTask.id + index"
                  class="value"
                >
                  {{ taskLabels[task.type] }}
                </div>
              </li>
              <li>
                <div class="lbl">
                  {{ $t("user_task_item.custom_expression") }}
                </div>
                <div class="value">
                  <span class="exp">{{ props.userTask.cronExpression }}</span>
                </div>
              </li>
            </ul>
          </div>
          <!-- asset status-->
          <div class="content-status-action col">
            <div class="actionbar">
              <ul>
                <li>
                  <UserTaskDropdownOptions :user-task="props.userTask" />
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserTask } from "~/types/UserTask";

const props = defineProps<{
  userTask: UserTask;
}>();

const taskLabels = ref<{ [key: string]: string }>({
  DATASET_EXECUTE_MAPPINGS: "Execute all mappings",
  DATASET_REPUBLISH: "Republish dataset",
  DATASET_RECREATE_INDEXES: "Recreate all indices",
  DATASET_RECREATE_DISTRIBUTIONS: "Recreate all distributions",
});
const removeUnderscore = (str: string): string => {
  return str.split("_").join(" ");
};
</script>

<style scoped></style>
