"use client";

import * as React from "react";

import type { ReactFC } from "@/lib/types";
import { SimpleTooltip } from "@/registry/new-york/simple-tooltip/SimpleTooltip";

interface ConditionalTooltipClassNames {
  wrapper?: string | undefined;
  tooltip?: string | undefined;
  content?: string | undefined;
}
interface ConditionalTooltipProps {
  condition?: boolean | undefined;
  content?: string | undefined;
  children: React.ReactNode;
  classNames?: ConditionalTooltipClassNames | undefined;
}
export const ConditionalTooltip: ReactFC<ConditionalTooltipProps> = ({
  condition,
  content,
  children,
  classNames,
}) => {
  if (!condition || !content) {
    return children;
  }
  return (
    <SimpleTooltip
      content={content}
      className={classNames?.wrapper}
      tooltipClassName={classNames?.tooltip}
    >
      {children}
    </SimpleTooltip>
  );
};
