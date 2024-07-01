export type LifeCycleState = {
  state: "STARTED" | "STOPPED" | string;
  startedAt?: string;
  completedAt?: string;
  count?: never;
  progress?: never;
};
