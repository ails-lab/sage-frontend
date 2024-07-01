import type { StateProgress } from "./StateProgress";

export type PublishStateString =
  | "PUBLISHED"
  | "PUBLISHING"
  | "PUBLISHING_FAILED"
  | "UNPUBLISHED"
  | "UNPUBLISHING_FAILED";

export type PublishState = {
  state: PublishStateString;
  startedAt?: string;
  completedAt?: string;
  count?: number;
  sparqlCount?: number;
  progress?: StateProgress[];
};
