import type { SelectOption } from "@/ui/lib/types";

export type SelectMobileViewType = "keep" | "native" | "bottom-drawer";

export type SimpleSelectOption = SelectOption;

export interface SimpleSelectProps {
  id?: string;
  "aria-label"?: string;
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
