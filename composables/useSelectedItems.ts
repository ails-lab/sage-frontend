import type { Annotator } from "~/types/Annotator";
import type { Instance, Mapping } from "~/types/Mapping";
import type { RdfDataFile } from "~/types/RdfDataFile";
import type { FilterValidation } from "~/types/filter-validation";
import type { Optional } from "~/types/optional";
import type { PagedValidation } from "~/types/paged-validation";
import type { ExecuteState } from "~/types/states";
import type { SchemeFile } from "~/types/SchemeFile";
import type { UserTask } from "~/types/UserTask";

const useSelectedItem = <T>(stateKey: string) => {
  const selectedItem = useState<Optional<T>>(stateKey);

  const select = (item: T) => {
    selectedItem.value = item;
  };

  const deselect = () => {
    selectedItem.value = undefined;
  };

  return { selectedItem, select, deselect };
};

export const useSelectedAnnotator = () => {
  const {
    selectedItem: selectedAnnotator,
    select: selectAnnotator,
    deselect: deselectAnnotator,
  } = useSelectedItem<Annotator>("selected-annotator");

  return { selectedAnnotator, selectAnnotator, deselectAnnotator };
};

export const useSelectedMapping = () => {
  const {
    selectedItem: selectedMapping,
    select: selectMapping,
    deselect: deselectMapping,
  } = useSelectedItem<{ mapping: Mapping; instance?: Instance }>(
    "selected-mapping"
  );

  return { selectedMapping, selectMapping, deselectMapping };
};

export const useSelectedRdf = () => {
  const {
    selectedItem: selectedRdfFile,
    select: selectRdfFile,
    deselect: deselectRdfFile,
  } = useSelectedItem<Instance>("selected-rdf-file");

  return { selectedRdfFile, selectRdfFile, deselectRdfFile };
};

export const useSelectedRdfPreview = () => {
  const {
    selectedItem: selectedRdfPreview,
    select: selectRdfPreview,
    deselect: deselectRdfPreview,
  } = useSelectedItem<{
    rdfFile: RdfDataFile;
    isPublished: boolean;
  }>("selected-rdf-preview");

  return { selectedRdfPreview, selectRdfPreview, deselectRdfPreview };
};

export const useSelectedD2rml = () => {
  const {
    selectedItem: selectedD2rml,
    select: selectD2rml,
    deselect: deselectD2rmlPreview,
  } = useSelectedItem<{
    mapping?: Mapping;
    scheme?: SchemeFile;
    mode: "view" | "edit";
  }>("selected-d2rml");

  return { selectedD2rml, selectD2rml, deselectD2rmlPreview };
};

export const useSelectedValidation = () => {
  const {
    selectedItem: selectedValidation,
    select: selectValidation,
    deselect: deselectValidation,
  } = useSelectedItem<
    | {
        type: "paged";
        aegId?: string;
        validation?: PagedValidation;
        propertyName?: never;
      }
    | {
        type: "filter";
        aegId?: string;
        validation?: FilterValidation;
        propertyName?: never;
      }
    | {
        type: "editor";
        aegId?: string;
        validation?: PagedValidation;
        propertyName?: string;
      }
    | {
        type: "export";
        aegId: string;
        validation?: never;
        propertyName?: never;
      }
  >("selected-validation");

  return { selectedValidation, selectValidation, deselectValidation };
};

type SelectedExecutionCommonParams = {
  id: string;
  isPublished: boolean;
  executeState?: ExecuteState;
};
type SelectedExecutionVariableParams =
  | {
      type:
        | "mapping"
        | "annotator"
        | "contributorValidation"
        | "filterValidation";
      mappingId?: never;
    }
  | {
      type: "instance";
      mappingId: string;
    };

export type SelectedExecutionParams = SelectedExecutionCommonParams &
  SelectedExecutionVariableParams;

export const useSelectedExecution = () => {
  const {
    selectedItem: selectedExecution,
    select: selectExecution,
    deselect: deselectExecution,
  } = useSelectedItem<SelectedExecutionParams>("selected-execution");

  return { selectedExecution, selectExecution, deselectExecution };
};

export const useSelectedSchemeFile = () => {
  const {
    selectedItem: selectedSchemeFile,
    select: selectSchemeFile,
    deselect: deselectSchemeFile,
  } = useSelectedItem<SchemeFile>("selected-scheme-file");

  return { selectedSchemeFile, selectSchemeFile, deselectSchemeFile };
};

export const useSelectedUserTask = () => {
  const {
    selectedItem: selectedUserTask,
    select: selectUserTask,
    deselect: deselectUserTask,
  } = useSelectedItem<UserTask>("selected-user-task");

  return { selectedUserTask, selectUserTask, deselectUserTask };
};
