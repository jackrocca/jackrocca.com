import * as React from "react";
import { tv } from "tailwind-variants";

import { processColor } from "@/lib/process-color";
import type { ReactFC } from "@/lib/types";
import { cn } from "@/lib/utils";

// Example default light color
const DEFAULT_LIGHT_COLOR = "bg-zinc-900";
// Example default dark color
const DEFAULT_DARK_COLOR = "bg-zinc-100";
const badge = tv({
  base: "flex items-center justify-center gap-1.5 rounded-md font-semibold transition-colors",
  defaultVariants: {
    size: "sm",
    variant: "default",
  },
  variants: {
    size: {
      lg: "px-3 py-1 text-sm",
      md: "px-2.5 py-1 text-xs",
      sm: "px-2 py-0.5 text-xs",
      xl: "px-3.5 py-1.5 text-sm",
      xs: "px-1.5 py-[2px] text-[9px]",
    },
    variant: {
      default:
        "bg-(--badge-color)/20 text-(--badge-color) dark:bg-(--badge-dark-color)/20 dark:text-(--badge-dark-color)",
      ghost:
        "text-(--badge-color) hover:bg-(--badge-color)/10 dark:text-(--badge-dark-color) dark:hover:bg-(--badge-dark-color)/10",
      outline:
        "border-1 border-(--badge-color)/30 bg-(--badge-color)/10 text-(--badge-color) dark:border-(--badge-dark-color)/30 dark:bg-(--badge-dark-color)/10 dark:text-(--badge-dark-color)",
    },
  },
});
export type BadgeSize = "xs" | "sm" | "md" | "lg" | "xl";
export interface BadgeClassNames {
  root?: string;
  icon?: string;
}
const iconSizeMap: Record<BadgeSize, number> = {
  lg: 14,
  md: 12,
  sm: 12,
  xl: 14,
  xs: 10,
};
export interface CustomBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  classNames?: BadgeClassNames;
  color: string;
  darkColor?: string;
  variant?: "default" | "outline" | "ghost";
  size?: BadgeSize;
  icon?: React.ElementType;
  iconSize?: number;
  leftIcon?: React.ElementType;
  rightIcon?: React.ElementType;
  leftSide?: React.ReactNode;
  rightSide?: React.ReactNode;
}
export const CustomBadge: ReactFC<CustomBadgeProps> = ({
  className,
  variant,
  size = "sm",
  color,
  darkColor,
  classNames,
  icon: Icon,
  iconSize,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  leftSide,
  rightSide,
  children,
  ...props
}) => {
  let finalColorValue: string;
  let finalDarkColorValue: string;
  if (color) {
    // User provided a color
    finalColorValue = color;
    finalDarkColorValue = darkColor ?? color;
  } else {
    // User provided no color, use defaults
    finalColorValue = DEFAULT_LIGHT_COLOR;
    finalDarkColorValue = darkColor ?? DEFAULT_DARK_COLOR;
  }
  const finalColor = processColor(finalColorValue);
  const finalDarkColor = processColor(finalDarkColorValue);
  const defaultIconSize = iconSizeMap[size];
  const finalIconSize = iconSize ?? defaultIconSize;
  const style: React.CSSProperties & {
    "--badge-color": string;
    "--badge-dark-color": string;
  } = {
    "--badge-color": `var(--color-${finalColor})`,
    "--badge-dark-color": `var(--color-${finalDarkColor})`,
  };
  const renderIcon = (
    IconComponent: React.ElementType | undefined,
    iconClassName?: string
  ) =>
    IconComponent && (
      <IconComponent
        size={finalIconSize}
        className={cn(classNames?.icon, "shrink-0", iconClassName)}
      />
    );
  return (
    <div
      style={style}
      className={cn(
        badge({
          size,
          variant,
        }),
        className,
        classNames?.root
      )}
      {...props}
    >
      {leftSide || renderIcon(LeftIcon)}
      {Icon ? renderIcon(Icon) : children}
      {rightSide || renderIcon(RightIcon)}
    </div>
  );
};
