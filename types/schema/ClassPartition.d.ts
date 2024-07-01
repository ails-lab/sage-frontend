import type { PropertyPartition } from "./PropertyPartition";
import type { PropType } from "vue";

export interface ClassPartition {
  class: string;
  type: string;
  entities: number;
  propertyPartition: PropertyPartition[];
}

export const ClassPartitionProp = Object as PropType<ClassPartition>;
