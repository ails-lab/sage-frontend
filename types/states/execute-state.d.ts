import type { StateProgress } from "./StateProgress";

export type ExecuteStateString =
  | "EXECUTED"
  | "NOT_EXECUTED"
  | "EXECUTING"
  | "EXECUTING_FAILED";

export type ExecuteState = {
  state: ExecuteStateString | string;
  startedAt?: string;
  completedAt?: string;
  count?: number;
  sparqlCount?: number;
  progress?: StateProgress[];
  fileName?: string;
};
