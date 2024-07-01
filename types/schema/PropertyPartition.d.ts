import type { PropType } from "vue";

export interface PropertyPartition {
  property: string;
  type: string;
  distinctObjects: number;
  triples: number;
}

export const PropertyPartitionProp = Object as PropType<PropertyPartition>;
