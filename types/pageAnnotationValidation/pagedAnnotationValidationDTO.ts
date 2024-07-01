import type { PagedAnnotationValidation } from "./PagedAnnotationValidation";

export interface PagedAnnotationValidationDTO {
  id: string;
  errorMessage: string | null;
  filter: string;
  lockId: string;
  mode: string;
  pagedAnnotationValidationId: string;
  pagedAnnotationValidationPageId: string;
  currentPage: number;
  totalPages: number;
  data: PagedAnnotationValidation[];
  onProperty: string[];
}
