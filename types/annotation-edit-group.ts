import type { FilterValidation } from "./filter-validation";
import type { PagedValidation } from "./paged-validation";

export type AnnotationEditGroup = {
  asProperty: string;
  autoexportable: boolean;
  count: number;
  datasetUuid: string;
  filterAnnotationValidations: FilterValidation[];
  id: string;
  onProperty?: { uri: string; type: string }[];
  pagedAnnotationValidations: PagedValidation[];
  uuid: string;
  published?: boolean;
};
