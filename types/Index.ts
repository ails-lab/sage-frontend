import type { LoadState, PublishState } from "./states";

export interface Index {
  createdAt?: string;
  id: string;
  identifier: string;
  loadState: LoadState;
  name: string;
  public: boolean;
  publishState: PublishState;
  scope: string;
  type: string;
  updatedAt?: string;
  uuid: string;
  maxGroup?: number;
  multiGroup?: boolean;
}
