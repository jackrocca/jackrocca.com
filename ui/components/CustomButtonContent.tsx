import * as React from "react";

import type { Size } from "@/ui/lib/types";
import { cn } from "@/ui/lib/utils";
import { defaultIconSizes, sizeStyles } from "@/ui/components/CustomButtonStyles";
import type { CustomButtonProps } from "@/ui/components/CustomButtonTypes";
import { Spinner } from "@/ui/components/Spinner";

export const getFinalIconSize = (size: Size, iconSize?: number | undefined) => {
  const foundSizeStyle = sizeStyles[size];
  if (!foundSizeStyle) {
    throw new Error(`Invalid size: ${size}`);
  }
  return iconSize ?? foundSizeStyle.iconSize ?? defaultIconSizes[size];
};
const renderIcon = ({
  IconComponent,
  className,
  classNames,
  finalIconSize,
}: {
  IconComponent?: React.ElementType | undefined;
  className?: string | undefined;
  classNames: NonNullable<CustomButtonProps["classNames"]>;
  finalIconSize: number;
}) =>
  IconComponent && (
    <IconComponent
      aria-hidden="true"
      focusable="false"
      size={finalIconSize}
      className={cn(classNames.icon, "shrink-0", className)}
    />
  );
export const getButtonContent = ({
  Icon,
  LeftIcon,
  RightIcon,
  children,
  classNames,
  finalIconSize,
  isIconOnly,
  leftSide,
  loading,
  rightSide,
  size,
}: {
  Icon?: React.ElementType | undefined;
  LeftIcon?: React.ElementType | undefined;
  RightIcon?: React.ElementType | undefined;
  children: React.ReactNode;
  classNames: NonNullable<CustomButtonProps["classNames"]>;
  finalIconSize: number;
  isIconOnly: boolean;
  leftSide: React.ReactNode;
  loading?: boolean | undefined;
  rightSide: React.ReactNode;
  size: Size;
}) => {
  const icon = (IconComponent?: React.ElementType | undefined) =>
    renderIcon({
      IconComponent,
      classNames,
      finalIconSize,
    });
  if (loading) {
    return (
      <>
        <Spinner size={size} className="shrink-0 text-current" />
        {!isIconOnly && <span className="truncate">{children}</span>}
      </>
    );
  }
  return (
    <>
      {leftSide || icon(LeftIcon)}
      {Icon ? icon(Icon) : children && <span className="truncate">{children}</span>}
      {rightSide || icon(RightIcon)}
    </>
  );
};
