import type { AnnotatorOnProperty } from "./Annotator";
import type { Vocabulary } from "./Vocabulary";
import type { ExecuteState, LifeCycleState, PublishState } from "./states";

export type PagedValidation = {
  active: boolean;
  annotatedPagesCount: number;
  annotationEditGroupId: string;
  complete: boolean;
  createdAt: Date;
  executeState: ExecuteState;
  id: string;
  lifecycleState: LifeCycleState;
  locked: boolean;
  mode: string;
  name: string;
  newExecution?: boolean;
  nonAnnotatedPagesCount: number;
  publishState: PublishState;
  systemVocabularies?: Vocabulary[];
  userVocabularies?: Vocabulary[];
  uuid: string;
};

export type ValidationProgress = {
  progress: number;
  totalAccepted: number;
  totalAdded: number;
  totalAnnotations: number;
  totalNeutral: number;
  totalRejected: number;
  totalValidations: number;
};

export type DatasetValidationProgress = PagedValidation & {
  asProperty: string;
  progress: ValidationProgress;
  propertyName: string;
  propertyPath: AnnotatorOnProperty;
};
