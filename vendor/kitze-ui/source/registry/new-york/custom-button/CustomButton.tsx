"use client";

import * as React from "react";

import { processColor } from "@/lib/process-color";
import type { ReactFC } from "@/lib/types";
import { useLinkableComponent } from "@/registry/hooks/useLinkableComponent";
import { ConditionalTooltip } from "@/registry/new-york/conditional-tooltip/ConditionalTooltip";
import {
  getButtonContent,
  getFinalIconSize,
} from "@/registry/new-york/custom-button/CustomButtonContent";
import * as CustomButtonStylesModule from "@/registry/new-york/custom-button/CustomButtonStyles";
import { borderVariantKey } from "@/registry/new-york/custom-button/CustomButtonStyles";
import type * as CustomButtonTypesModule from "@/registry/new-york/custom-button/CustomButtonTypes";

const DEFAULT_LIGHT_COLOR = "bg-zinc-900";
const DEFAULT_DARK_COLOR = "bg-zinc-100";
const EMPTY_CLASS_NAMES: NonNullable<CustomButtonProps["classNames"]> = {};
export const { buttonVariants } = CustomButtonStylesModule;
export const { defaultIconSizes } = CustomButtonStylesModule;
export const { sizeStyles } = CustomButtonStylesModule;
export const { spinnerSizeMap } = CustomButtonStylesModule;
export type ButtonVariantsProps = CustomButtonStylesModule.ButtonVariantsProps;
export type CustomButtonProps = CustomButtonTypesModule.CustomButtonProps;
export type CustomButtonVariant = CustomButtonTypesModule.CustomButtonVariant;
export const CustomButton: ReactFC<CustomButtonProps> = ({
  className,
  variant = "filled",
  size = "md",
  circle = false,
  color,
  darkColor,
  style,
  icon: Icon,
  iconSize,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  leftSide,
  rightSide,
  loading,
  children,
  classNames = EMPTY_CLASS_NAMES,
  href,
  external,
  disabled = false,
  as = "button",
  tooltip,
  ...props
}) => {
  const { Component, linkProps } = useLinkableComponent({
    as,
    external,
    href,
    ...props,
  });
  const finalColorValue = color || DEFAULT_LIGHT_COLOR;
  const finalDarkColorValue = darkColor ?? (color || DEFAULT_DARK_COLOR);
  const finalColor = processColor(finalColorValue);
  const finalDarkColor = processColor(finalDarkColorValue);
  const finalIconSize = getFinalIconSize(size, iconSize);
  const hasIcon = Boolean(Icon || LeftIcon || RightIcon);
  const isIconOnly = circle || (!children && hasIcon);
  const buttonContent = getButtonContent({
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
  });
  const buttonAttributes = {
    className: buttonVariants({
      class: className,
      isIconButton: isIconOnly,
      [borderVariantKey]: circle ? "circle" : "default",
      size,
      variant,
    }),
    style: {
      "--button-color": `var(--color-${finalColor})`,
      "--button-dark-color": `var(--color-${finalDarkColor})`,
      ...style,
    } satisfies React.CSSProperties & {
      "--button-color": string;
      "--button-dark-color": string;
    },
    ...linkProps,
    ...props,
  };
  const button = (
    <Component
      {...buttonAttributes}
      disabled={Component === "button" ? disabled || loading : undefined}
      href={href}
    >
      {buttonContent}
    </Component>
  );

  return tooltip ? (
    <ConditionalTooltip
      content={String(tooltip)}
      condition={true}
      classNames={{
        tooltip: classNames.tooltip,
      }}
    >
      {button}
    </ConditionalTooltip>
  ) : (
    button
  );
};
CustomButton.displayName = "CustomButton";
