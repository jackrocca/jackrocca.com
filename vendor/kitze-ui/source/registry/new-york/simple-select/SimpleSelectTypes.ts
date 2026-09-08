import type { SelectOption } from "@/lib/types";

export type SelectMobileViewType = "keep" | "native" | "bottom-drawer";

export type SimpleSelectOption = SelectOption;

export interface SimpleSelectProps {
  options: SelectOption[];
  value?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  placeholder?: string | undefined;
  className?: string | undefined;
  triggerClassName?: string | undefined;
  disabled?: boolean | undefined;
  withSearch?: boolean | undefined;
  searchPlaceholder?: string | undefined;
  mobileView?: SelectMobileViewType | undefined;
  mobileViewSearch?: boolean | undefined;
  drawerTitle?: string | undefined;
}
