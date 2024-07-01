<template>
  <div :class="[$style['state-block'], classnames?.block || '']">
    <div class="row">
      <ul :class="$style['state-status']">
        <li>
          <div :class="[lblClass, $style['text-bold']]">
            {{ $t(`state.${type}.title`) }}
          </div>
          <div :class="[statusClass]">
            {{ $t(`state.${type}.${state.state.toLowerCase()}`).toUpperCase() }}
          </div>
        </li>
        <li v-if="isInProgress && state?.startedAt">
          <div :class="lblClass">
            {{ $t("state.started_at") }}
          </div>
          <div :class="[statusClass]">
            {{ formatTimestamp(state.startedAt) }}
          </div>
        </li>
        <li v-else-if="state?.completedAt">
          <div :class="lblClass">
            {{ $t("state.completed_at") }}
          </div>
          <div :class="[statusClass]">
            {{ formatTimestamp(state.completedAt) }}
          </div>
        </li>
        <li v-if="state.count && state.count >= 0">
          <div :class="lblClass">
            {{ $t("mapping_item.items") }}
          </div>
          <div :class="[statusClass]">
            {{ state.count.toLocaleString("en-US") }}
          </div>
        </li>
      </ul>
    </div>
    <div v-if="state?.progress?.length" :class="itemProgressClass">
      <div>
        <ItemsProgress
          :progress="state.progress"
          :classname="classnames?.table"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExecuteState, PublishState } from "~/types/states";
const $style = useCssModule();
const props = defineProps<{
  type: "execute" | "publish";
  state: ExecuteState | PublishState;
  classnames?: {
    block?: string;
    table?: string;
    label?: string;
  };
}>();

const isInProgress = computed(() => {
  const stateString = props.state.state.toLowerCase();
  return (
    stateString === "EXECUTING" ||
    stateString === "PUBLISHING" ||
    stateString === "PENDING"
  );
});

const statusClass = computed(() => {
  const stateString = props.state.state.toLowerCase();
  if (
    stateString === "execution_failed" ||
    stateString === "publishing_failed"
  ) {
    return $style.fail;
  }
  if (stateString === "published" || stateString === "executed") {
    return $style.success;
  }
  return $style.not;
});

const lblClass = computed(
  () => `${$style.lbl} ${props.classnames?.label || ""}`
);

const itemProgressClass = computed(() => `row ${$style["contain-content"]}`);
</script>

<style lang="scss" module>
@import "@styles/variables.scss";

.state-block {
  padding-top: 12px;
  border-top: 1px solid $accent-borderline;
}
.text-bold {
  font-weight: bold;
}
.success {
  color: #6ea543;
}
.fail {
  color: #eb6440;
}
.pending {
  color: #2163ac;
}
.not {
  color: #8598ad;
}

.lbl {
  font-size: 11px;
  color: #496c93;
  text-transform: uppercase;
}

.state-status {
  display: inline-flex;
  margin-bottom: 1rem;
  li {
    list-style: none;
    display: inline-block;
    margin-right: 30px;
  }
}

.contain-content {
  max-width: 480px;
}
</style>
