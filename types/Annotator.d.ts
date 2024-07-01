import type { ExecuteState, PublishState } from "./states";

type Tag = "TERM" | "PLACE" | "TIME" | string;

type Variant = {
  name: string;
  rank: "SINGLE" | "MULTIPLE" | string;
};

export type ServiceAnnotatorParameter = {
  name: string;
  required: boolean;
  type: string;
  defaultValue?: string;
  values?: Array<string>;
};

export type ServiceAnnotator = {
  asProperties?: Array<string>;
  description?: string;
  identifier: string;
  parameters: Array<ServiceAnnotatorParameter>;
  tags?: Array<Tag>;
  title: string;
  variants: Array<Variant>;
};

type Target = {
  uri: string;
  prefix: string;
  namespace: string;
  localName: string;
};

type Parameter = {
  name: string;
  value: string;
};

type PreProcess = {
  function: string;
  parameters: { name: string; value: string }[];
};

export type AnnotatorOnProperty = Target & {
  type: "PROPERTY" | "CLASS";
};

export type Annotator = {
  annotator?: string;
  asProperty: string;
  createdAt?: string;
  defaultTarget?: Target;
  executeState: ExecuteState;
  id: string;
  name: string;
  newExecution?: boolean;
  onProperty: AnnotatorOnProperty[];
  ownedByUser: boolean;
  parameters: Array<Parameter>;
  preprocess?: PreProcess[];
  publishState: PublishState;
  tags?: Array<Tag>;
  thesaurus?: string;
  updatedAt?: string;
  uuid?: string;
  variant: Variant;
};
