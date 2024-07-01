import type { ClassPartition } from "./ClassPartition";

export interface DatasetSchema {
  id: string;
  title: string;
  issued: string;
  type: string[];
  classPartition: ClassPartition[];
}
