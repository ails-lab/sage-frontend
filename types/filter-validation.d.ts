import type { ExecuteState, PublishState } from "./states";

export type FilterValidationFilter =
  | {
      action: "REPLACE";
      selectExpression: string;
      newValue: string;
    }
  | {
      action: "DELETE";
      selectExpression: string;
    };

export type FilterValidation = {
  id: string;
  name?: string;
  executeState: ExecuteState;
  publishState: PublishState;
  newExecution?: boolean;
  createdAt: string;
  filters: FilterValidationFilter[];
};
