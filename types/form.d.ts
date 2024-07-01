export type Option = {
  value: string;
  label: string;
  disabled?: boolean;
  hidden?: boolean;
};

export type SelectInputProps = {
  id?: string;
  error?: string;
  label?: string;
  modelValue?: string;
  name?: string;
  notifyText?: string;
  ariaLabel?: string;
  isRequired?: boolean;
  options?: Option[];
  groupOptions?: { label: string; options: Option[] }[];
  placeholder?: string;
};

export type TextInputProps = {
  id?: string;
  error?: string;
  label?: string;
  modelValue?: string;
  name?: string;
  notifyText?: string;
  ariaLabel?: string;
  isRequired?: boolean;
  rows?: number;
};

export type FileInputProps = {
  id?: string;
  error?: string;
  label?: string;
  labelDescription?: string;
  notifyText?: string;
  modelValue?: File;
  name?: string;
  ariaLabel?: string;
  accept?: string;
  isRequired?: boolean;
};

export type CheckboxInputProps = {
  id?: string;
  classname?: string;
  error?: string;
  label?: string;
  modelValue?: boolean;
  name?: string;
  notifyText?: string;
  ariaLabel?: string;
  isRequired?: boolean;
};
