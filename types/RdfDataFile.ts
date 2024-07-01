import type { PropType } from "vue";
import type { ExecuteState, PublishState } from "./states";

export type RdfDataFile = {
  active: boolean;
  createdAt: string;
  datasetId: string;
  fileName?: string;
  executeState: ExecuteState & { fileName: string };
  newExecution?: boolean;
  id: string;
  name: string;
  description?: string;
  order: number;
  publishState: PublishState;
  updatedAt: string;
  uuid: string;
};

export const RdfDataFileProp = Object as PropType<RdfDataFile>;
