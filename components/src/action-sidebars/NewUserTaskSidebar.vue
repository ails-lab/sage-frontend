<template>
  <ActionSidebar id="offcanvasAddTask" ref="addUserTaskCanvas">
    <ActionSidebarHeader
      :title="
        $t(
          selectedUserTask?.id
            ? 'add_user_task_sidebar.title.edit'
            : 'add_user_task_sidebar.title.new'
        )
      "
      :description="$t('add_user_task_sidebar.description')"
      :close-label="$t('cancel')"
      @close="closeSidebar"
    >
      <template #action>
        <ActionSidebarHeaderAction
          :aria-label="$t('save')"
          @click="saveUserTask"
          >{{ $t("save") }}
        </ActionSidebarHeaderAction>
      </template>
    </ActionSidebarHeader>
    <ActionSidebarBody>
      <div class="sage-form">
        <div class="field row">
          <label class="form-label col" for="indexType">
            <div class="lbl">{{ $t("name") }} *</div>
            <div class="desc">
              {{ $t("add_user_task_sidebar.name_description") }}
            </div>
          </label>
          <div class="form-field col">
            <FormTextInput v-model="name" @input="clearFormErrorAt('name')" />

            <span v-if="formErrorAt.name.length" class="form-error">
              {{ formErrorAt.name }}
            </span>
          </div>
        </div>
        <div class="field row">
          <label class="form-label col">
            <div class="lbl">{{ $t("add_user_task_sidebar.tasks") }} *</div>
            <div class="desc">
              {{ $t("add_user_task_sidebar.tasks_description") }}
            </div>
          </label>
          <div class="form-field col">
            <div v-for="(task, index) of tasks" :key="index">
              <div class="form-sublabel">
                {{ $t("add_user_task_sidebar.task") }} {{ index + 1 }}
              </div>
              <div class="form-field-row">
                <div class="form-field-box">
                  <select
                    v-model="tasks[index].type"
                    class="form-select"
                    @input="clearFormErrorAt('tasks')"
                  >
                    <option selected disabled value="">
                      {{ $t("please_select") }}
                    </option>
                    <option value="DATASET_EXECUTE_MAPPINGS">
                      {{ $t("add_user_task_sidebar.execute_all_mappings") }}
                    </option>
                    <option value="DATASET_REPUBLISH">
                      {{ $t("add_user_task_sidebar.republish_dataset") }}
                    </option>
                    <option value="DATASET_RECREATE_INDEXES">
                      {{ $t("add_user_task_sidebar.recreate_all_indices") }}
                    </option>
                    <option value="DATASET_RECREATE_DISTRIBUTIONS">
                      {{
                        $t("add_user_task_sidebar.recreate_all_distributions")
                      }}
                    </option>
                  </select>
                </div>

                <div
                  v-if="tasks.length > 1 || index > 0"
                  class="form-field-action"
                >
                  <a class="delete" @click="deleteTask(index)">
                    <i class="fa-regular fa-trash-can"></i>
                  </a>
                </div>
              </div>
            </div>
            <span v-if="formErrorAt.tasks.length" class="form-error">
              {{ formErrorAt.tasks }}
            </span>

            <div class="form-sublabel space">
              <div
                class="form-field-action add-action"
                @click="tasks.push({ type: '', group: -1 })"
              >
                <a class="add" href="#">
                  <i class="plus fa-solid fa-plus"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div class="field row wide">
          <label class="form-label col" for="indexType">
            <div class="lbl">
              {{ $t("add_user_task_sidebar.task_execution_time_interval") }} *
            </div>
          </label>
          <div class="form-field col">
            <div class="desc">
              {{ $t("add_user_task_sidebar.cron_description") }}
            </div>
          </div>
        </div>
        <div class="field wide">
          <div class="wrap">
            <cron-light
              v-model="cronExpression"
              class="form-field-cron active"
            ></cron-light>
          </div>
        </div>
        <div class="field row wide">
          <label class="form-label col"></label>
          <div class="form-field col">
            <div class="form-sublabel" for="cron-exp">
              {{ $t("add_user_task_sidebar.task_execution_time_interval") }}
            </div>
            <div class="form-field-row">
              <div class="form-field-box">
                <input
                  v-model="cronExpression"
                  class="form-control"
                  disabled
                  type="text"
                  aria-label="cron-exp"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ActionSidebarBody>
  </ActionSidebar>
</template>

<script setup lang="ts">
import "@vue-js-cron/light/dist/light.css";
import { CronLight } from "@vue-js-cron/light";
const { t } = useI18n();
const { toaster } = useToaster();

const { selectNewDataset } = useSidebarDataStore();
const { selectedDataset } = storeToRefs(useSidebarDataStore());
const { $userTaskApi } = useNuxtApp();
const { selectedUserTask, deselectUserTask } = useSelectedUserTask();

const addUserTaskCanvas = ref(null);
const name = ref<string>("");
const cronExpression = ref<string>("* * * * *");
const tasks = ref<{ type: string; group: number }[]>([{ type: "", group: -1 }]);
const freshRunOnly = ref<boolean>(false);

const formErrorAt = ref<{
  name: string;
  tasks: string;
}>({
  name: "",
  tasks: "",
});

watch(
  () => selectedUserTask.value,
  (newValue) => {
    if (!newValue) {
      return;
    }
    name.value = newValue.name;
    tasks.value = newValue.tasks ?? [{ type: "", group: -1 }];
    cronExpression.value = newValue.cronExpression ?? "";
    freshRunOnly.value = newValue.freshRunOnly ?? false;
  }
);

watch(
  () => selectedDataset.value.id,
  () => {
    closeSidebar();
  }
);

const resetForm = () => {
  name.value = "";
  cronExpression.value = "* * * * *";
  tasks.value = [{ type: "", group: -1 }];
  freshRunOnly.value = false;
};

const clearFormErrorAt = (fieldName: "name" | "tasks") => {
  formErrorAt.value[fieldName] = "";
};

const deleteTask = (index: number) => {
  tasks.value.splice(index, 1);
};

const createUserTask = async () => {
  const { error }: any = await $userTaskApi.createUserTask(
    selectedDataset.value.id,
    {
      name: name.value,
      cronExpression: cronExpression.value,
      tasks: tasks.value,
      freshRunOnly: freshRunOnly.value,
    }
  );
  if (error.value) {
    toaster.error(error.value.data.message);
  } else {
    toaster.success(
      t("add_user_task_sidebar.success.creating", {
        userTaskName: name.value,
      })
    );
    await selectNewDataset(selectedDataset.value.id);
    closeSidebar();
  }
};
const updateUserTask = async () => {
  const { error }: any = await $userTaskApi.updateUserTask(
    selectedUserTask.value?.id as string,
    {
      name: name.value,
      cronExpression: cronExpression.value,
      tasks: tasks.value,
      freshRunOnly: freshRunOnly.value,
    }
  );
  if (error.value) {
    toaster.error(error.value.data.message);
  } else {
    toaster.success(
      t("add_user_task_sidebar.success.updating", {
        userTaskName: name.value,
      })
    );
    await selectNewDataset(selectedDataset.value.id);
    closeSidebar();
  }
};

const validUserTask = (): boolean => {
  if (!name.value.length) {
    formErrorAt.value.name = "You need to provide a name";
    return false;
  }
  if (tasks.value.some((task) => task.type === "")) {
    formErrorAt.value.tasks =
      "You have empty tasks. Select an option for every task.";
    return false;
  }
  return true;
};
const saveUserTask = () => {
  if (!validUserTask()) return;
  if (selectedUserTask.value?.id) updateUserTask();
  else createUserTask();
};

const closeSidebar = () => {
  resetForm();
  clearFormErrorAt("name");
  clearFormErrorAt("tasks");
  deselectUserTask();
  hideOffcanvas(addUserTaskCanvas);
};
</script>

<style lang="scss" scoped>
.add-action {
  float: none !important;
  transform: translate(50%);
  left: calc(50% - 30px);
}
</style>
