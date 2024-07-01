import type { AnnotationDetails } from "./Details";

export interface PagedAnnotationValidation {
  count: number;
  details: AnnotationDetails[];
  onValue: { datatype: string; language: string; lexicalForm: string };
}
