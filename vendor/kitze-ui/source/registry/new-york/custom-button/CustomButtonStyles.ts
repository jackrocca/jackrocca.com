import * as React from "react";
import { tv } from "tailwind-variants";

import type { Size } from "@/lib/types";

interface SizeStyle {
  iconSize?: number;
}
export const sizeStyles: Record<Size, SizeStyle> = {
  lg: {
    iconSize: 20,
  },
  md: {
    iconSize: 16,
  },
  sm: {
    iconSize: 16,
  },
  xl: {
    iconSize: 24,
  },
  xs: {
    iconSize: 14,
  },
};
export const spinnerSizeMap: Record<Size, number> = {
  lg: 20,
  md: 16,
  sm: 16,
  xl: 24,
  xs: 14,
};
export const defaultIconSizes: Record<Size, number> = {
  lg: 20,
  md: 16,
  sm: 16,
  xl: 24,
  xs: 14,
};
// Preserve the published variant key while naming the local value for its role.
export const borderVariantKey = "shape";

export const buttonVariants = tv({
  base: "focus-visible:ring-ring inline-flex cursor-pointer items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-all focus-visible:ring-1 focus-visible:outline-hidden active:scale-95 disabled:pointer-events-none disabled:opacity-50",
  compoundVariants: [
    {
      class: "text-red-500!",
      color: "secondary",
      variant: "light",
    },
    {
      class:
        "flex h-6 max-h-6 min-h-6 w-6 max-w-6 min-w-6 items-center justify-center",
      isIconButton: true,
      size: "xs",
    },
    {
      class:
        "flex h-8 max-h-8 min-h-8 w-8 max-w-8 min-w-8 items-center justify-center",
      isIconButton: true,
      size: "sm",
    },
    {
      class:
        "flex h-10 max-h-10 min-h-10 w-10 max-w-10 min-w-10 items-center justify-center",
      isIconButton: true,
      size: "md",
    },
    {
      class:
        "flex h-12 max-h-12 min-h-12 w-12 max-w-12 min-w-12 items-center justify-center",
      isIconButton: true,
      size: "lg",
    },
    {
      class: "h-7 px-2",
      isIconButton: false,
      size: "xs",
    },
    {
      class: "h-9 px-3",
      isIconButton: false,
      size: "sm",
    },
    {
      class: "h-10 px-4",
      isIconButton: false,
      size: "md",
    },
    {
      class: "h-12 px-5",
      isIconButton: false,
      size: "lg",
    },
  ],
  defaultVariants: {
    isIconButton: false,
    [borderVariantKey]: "default",
    size: "md",
    variant: "filled",
  },
  variants: {
    isIconButton: {
      false: "",
      true: "",
    },
    [borderVariantKey]: {
      circle: "rounded-full!",
      default: "rounded-md",
    },
    size: {
      lg: "text-base",
      md: "text-sm",
      sm: "text-sm",
      xl: "text-lg",
      xs: "text-xs",
    },
    variant: {
      filled:
        "bg-[var(--button-color)] text-white hover:opacity-90 dark:bg-[var(--button-dark-color)] dark:text-black",
      ghost:
        "bg-transparent text-[var(--button-color)] hover:bg-[var(--button-color)]/10 dark:text-[var(--button-dark-color)] dark:hover:bg-[var(--button-dark-color)]/10",
      light:
        "bg-[var(--button-color)]/10 text-[var(--button-color)] hover:bg-[var(--button-color)]/20 dark:bg-[var(--button-dark-color)]/10 dark:text-[var(--button-dark-color)] dark:hover:bg-[var(--button-dark-color)]/20",
      link: "text-[var(--button-color)] underline-offset-4 hover:underline dark:text-[var(--button-dark-color)]",
      outline:
        "border border-[var(--button-color)]/50 bg-transparent text-[var(--button-color)] hover:bg-[var(--button-color)]/10 dark:border-[var(--button-dark-color)]/50 dark:text-[var(--button-dark-color)] dark:hover:bg-[var(--button-dark-color)]/10",
      unstyled: "",
    },
  },
});
export type ButtonVariantsProps = React.ComponentProps<
  typeof buttonVariants
> & {
  class?: string;
};
