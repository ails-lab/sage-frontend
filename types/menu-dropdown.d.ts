export type MenuDropdownItem = {
  label?: string;
  iconClass?: string;
  isDivider?: boolean;
  isDisabled?: boolean;
  isHidden?: boolean;
  href?: string;
  dataBsToggle?: string;
  onClick?: (...args: any[]) => void;
};

export type MenuDropdownItems = MenuDropdownItem[];

export type MenuDropdownProps = {
  id: string;
  classnames?: {
    root?: string;
    icon?: string;
    menu?: string;
    item?: string;
  };
  items: MenuDropdownItems;
};
