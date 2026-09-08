"use client";

import * as React from "react";

import type { ReactFC } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { SpinnerProps } from "@/registry/new-york/spinner/Spinner";
import { Spinner } from "@/registry/new-york/spinner/Spinner";

export interface FillHeightSpinnerProps extends SpinnerProps {
  /**
   * Optional className for the wrapper div
   */
  wrapperClassName?: string;
}

export const FillHeightSpinner: ReactFC<FillHeightSpinnerProps> = ({
  size = "xl",
  wrapperClassName,
  ...props
}) => (
  <div
    className={cn(
      "flex w-full flex-1 items-center justify-center",
      wrapperClassName
    )}
  >
    <Spinner size={size} {...props} />
  </div>
);
