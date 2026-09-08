import type { VariantProps } from "class-variance-authority";
import * as React from "react";

import type { SelectOption } from "@/lib/types";
import type { advancedSelectVariants } from "@/registry/new-york/advanced-select/AdvancedSelectVariants";

export type AdvancedSelectOption = SelectOption;

export interface AdvancedSelectProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof advancedSelectVariants> {
  options: AdvancedSelectOption[];
  onValueChange?: ((value: string[]) => void) | undefined;
  value?: string[] | undefined;
  defaultValue?: string[] | undefined;
  searchable?: boolean | undefined;
  placeholder?: string | undefined;
  maxCount?: number | undefined;
  modalPopover?: boolean | undefined;
  asChild?: boolean | undefined;
  className?: string | undefined;
  leftIcon?: React.ElementType | undefined;
  rightIcon?: React.ElementType | undefined;
  loading?: boolean | undefined;
  onCreate?: ((value: string) => void) | undefined;
}

export type AdvancedSelectVariant = AdvancedSelectProps["variant"];
