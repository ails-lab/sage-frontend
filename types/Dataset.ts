import type { Mapping } from "./Mapping";
import type { RdfDataFile } from "./RdfDataFile";
import type { User } from "./User";
import type { UserTask } from "./UserTask";
import type { LoadState, PublishState } from "./states";

export type SchemeType =
  | "d2rml"
  | "shacl"
  | "annotator"
  | "comparator"
  | "index";

export interface Dataset {
  createdAt?: string;
  datasets?: Dataset[];
  distributions?: object[];
  files?: object[];
  id: string;
  identifier: string;
  indices?: object[];
  loadState: LoadState;
  mappings?: Mapping[];
  maxGroup?: number;
  multiGroup?: boolean;
  name: string;
  public: boolean;
  publishState: PublishState;
  rdfFiles?: RdfDataFile[];
  scope: string;
  tags?: string[];
  type: string;
  updatedAt?: string;
  userTasks?: UserTask[];
  user: User;
  uuid: string;
}
