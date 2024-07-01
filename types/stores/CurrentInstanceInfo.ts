import type {
  ValidationMode,
  ValidationModeDimension,
} from "../validation-mode";
import type { Operation, Function } from "@/types/Function";
import type { Services } from "@/types/Services";
import type { Vocabulary } from "~/types/Vocabulary";

export type MappingSampleParameter = {
  name: string;
  label: string;
};
export type MappingSampleTemplate = {
  id: string;
  name: string;
  parameters?: MappingSampleParameter[];
};
export type DatasetTemplate = {
  id: string;
  name: string;
};

export type Templates = {
  mappingSample: MappingSampleTemplate[];
  dataset: DatasetTemplate[];
};
export interface CurrentInstanceInfo {
  services: Services;
  functions: Function[];
  operations: Operation[];
  datasetTemplates: DatasetTemplate[];
  mappingSampleTemplates: MappingSampleTemplate[];
  validationModes: ValidationMode[];
  validationModesDimensions: ValidationModeDimension[];
  indexStructures: any[];
  instance: any;
  rdfVocabularies: Vocabulary[];
  allVocabularies: Vocabulary[];
}
