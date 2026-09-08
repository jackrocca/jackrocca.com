"use client";

import Link from "next/link";
import * as React from "react";

export interface LinkableProps {
  href?: string | undefined;
  external?: boolean | undefined;
  target?: string | undefined;
  rel?: string | undefined;
  as?: React.ElementType | undefined;
}
export const useLinkableComponent = <T extends LinkableProps>({
  href,
  external,
  as = "div",
  ...rest
}: T) => {
  const isExternal =
    external ??
    (href?.startsWith("http") ||
      href?.startsWith("mailto:") ||
      href?.startsWith("tel:"));
  if (href) {
    if (isExternal) {
      return {
        Component: "a" as const,
        href,
        linkProps: {
          rel: "noopener noreferrer",
          target: "_blank",
          ...rest,
        },
      };
    }
    return {
      Component: Link,
      href,
      linkProps: {
        ...rest,
      },
    };
  }
  return {
    Component: as,
    href,
    linkProps: {
      ...rest,
    },
  };
};
