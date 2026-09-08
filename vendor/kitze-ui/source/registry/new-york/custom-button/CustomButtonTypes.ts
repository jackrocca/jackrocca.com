import * as React from "react";

import type { Size } from "@/lib/types";

export type CustomButtonVariant =
  | "filled"
  | "light"
  | "outline"
  | "ghost"
  | "unstyled"
  | "link";

export interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: React.Ref<HTMLButtonElement> | undefined;
  size?: Size | undefined;
  variant?: CustomButtonVariant | undefined;
  color?: string | undefined;
  darkColor?: string | undefined;
  circle?: boolean | undefined;
  icon?: React.ElementType | undefined;
  iconSize?: number | undefined;
  leftIcon?: React.ElementType | undefined;
  rightIcon?: React.ElementType | undefined;
  leftSide?: React.ReactNode | undefined;
  rightSide?: React.ReactNode | undefined;
  loading?: boolean | undefined;
  href?: string | undefined;
  external?: boolean | undefined;
  as?: React.ElementType | undefined;
  tooltip?: React.ReactNode | undefined;
  classNames?:
    | {
        icon?: string | undefined;
        tooltip?: string | undefined;
      }
    | undefined;
}
