import type { PropType } from "vue";
import type { ExecuteState, PublishState } from "./states";

export type Binding = {
  name: string;
  value: string;
};

export interface Instance {
  id: string;
  active: boolean;
  binding: Binding[];
  executeState: ExecuteState;
  newExecution: boolean;
  publishState: PublishState;
  publishedFromCurrentFileSystem: boolean;
  validateState: object;
  dataFiles?: string[];
  identifier?: string;
}

export interface MappingParameter {
  name: string;
  datatype?: string;
  required?: boolean;
  hidden?: boolean;
  description?: string;
  format?: string[];
  defaultValue?: {};
}

export interface Mapping {
  id: string;
  uuid: string;
  name: string;
  description?: string;
  identifier?: string;
  type: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  datasetId: string;
  files: object[];
  dataFiles?: string[];
  fileName?: string;
  instances: Instance[];
  order: number;
  parameters: MappingParameter[];
  template: boolean;
  templateId?: string;
  d2rmlId?: string;
  d2rmlIdBound?: boolean;
  shaclId?: string[];
}

export const MappingProp = Object as PropType<Mapping>;
