import { Edit } from "lucide-react";
import React from "react";

import type { ReactFC } from "@/lib/types";
import type { CommonMenuItemProps } from "@/registry/new-york/simple-dropdown-menu/CommonMenuItem";
import { CommonMenuItem } from "@/registry/new-york/simple-dropdown-menu/CommonMenuItem";

export interface CommonMenuItemEditProps extends Omit<
  CommonMenuItemProps,
  "children" | "leftIcon"
> {
  label?: string;
}

export const CommonMenuItemEdit: ReactFC<CommonMenuItemEditProps> = ({
  label = "Edit",
  ...props
}) => (
  <CommonMenuItem leftIcon={Edit} {...props}>
    {label}
  </CommonMenuItem>
);
