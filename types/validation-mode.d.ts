export type ValidationModeDimension = {
  code: string;
  name: string;
};

export type ValidationMode = {
  code: string;
  dimensions: ValidationModeDimension[];
  label: string;
};
