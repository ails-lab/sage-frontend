type Label = {
  id: string;
  description?: { language: string; value: string }[];
  label?: { language: string; value: string }[];
};

export interface AnnotationDetails {
  id?: string;
  count?: number;
  annotatorInfo?: { name: string };
  defaultTargets?: string[];
  selectedTarget?: string;
  othersTarget?: string;
  start?: number;
  end?: number;
  othersAccepted?: number;
  othersRejected?: number;
  score?: number;
  state?: string;
  value?: string;
  label?: Label[];
  references?: any;
  hide?: boolean;
  showTargetProperty?: string;
  lastSplitChar?: string;
  showTargetRdf?: any;
  properties?: any;
  arrayIndex?: number;
}
