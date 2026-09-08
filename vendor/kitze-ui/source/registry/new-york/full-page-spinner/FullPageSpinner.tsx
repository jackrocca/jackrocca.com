"use client";

import * as React from "react";

import type { ReactFC } from "@/lib/types";
import type { SpinnerProps } from "@/registry/new-york/spinner/Spinner";
import { Spinner } from "@/registry/new-york/spinner/Spinner";

export type FullPageSpinnerProps = SpinnerProps;
export const FullPageSpinner: ReactFC<FullPageSpinnerProps> = ({
  size = "xl",
  ...props
}) => (
  <div className="flex min-h-screen min-w-screen items-center justify-center">
    <Spinner size={size} {...props} />
  </div>
);
