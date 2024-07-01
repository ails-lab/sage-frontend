import type { LoadState, PublishState } from "./states";

type UriDescriptor = {
  namespace: string;
  prefix: string;
};

export type Vocabulary = {
  classes?: string[];
  id: string;
  name: string;
  pattern?: string;
  prefix?: string[];
  properties: string[];
  uriDescriptors: UriDescriptor[];
};

export type UserVocabulary = {
  createdAt: string;
  entityDescriptors: UriDescriptor[];
  id: string;
  identifier: string;
  loadState: LoadState;

  maxGroup: number;
  multiGroup: boolean;
  name: string;
  public: boolean;
  publishState: PublishState;
  scope: string;
  type: string;
  updatedAt: string;
  uuid: string;
};
