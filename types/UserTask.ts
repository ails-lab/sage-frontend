import type { RunState } from "./states";

export interface UserTask {
  id: string;
  name: string;
  cronExpression: string;
  freshRunOnly: boolean;
  tasks: { group: number; type: string }[];
  runState?: RunState;
  createdAt?: string;
  updatedAt?: string;
}
