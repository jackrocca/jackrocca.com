"use client";

import * as React from "react";

import type { ReactFC } from "@/lib/types";

export const ConditionalWrap: ReactFC<{
  condition?: boolean | undefined;
  wrap: (c: React.ReactNode) => React.ReactElement;
  elseWrap?: ((c: React.ReactNode) => React.ReactElement) | undefined;
}> = ({ condition, children, wrap, elseWrap }) => {
  if (condition) {
    return wrap(children);
  }
  return elseWrap ? elseWrap(children) : children;
};
