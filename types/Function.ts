export interface Function {
  uri: string;
  parameters: string[];
}

export interface Operation {
  uri: string;
  parameters: string[];
}

export type PreProcess = {
  function?: string;
  modifier?: string;
  parameters?: { name: string; value: string }[];
};
