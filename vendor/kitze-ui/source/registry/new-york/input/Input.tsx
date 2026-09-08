"use client";

import type { ElementType, InputHTMLAttributes, ReactNode } from "react";
import React from "react";

import { cn } from "@/lib/utils";
import { InputAffix } from "@/registry/new-york/input/InputAffix";
import { Spinner } from "@/registry/new-york/spinner/Spinner";

export interface InputClassNames {
  container?: string;
  input?: string;
  leftIcon?: string;
  rightIcon?: string;
  leftItem?: string;
  rightItem?: string;
}
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ElementType;
  rightIcon?: ElementType;
  leftItem?: ReactNode;
  rightItem?: ReactNode;
  iconClassName?: string;
  classNames?: InputClassNames;
  /**
   * Whether the input is in a loading state
   * @default false
   */
  isLoading?: boolean;
  /**
   * The size of the loading spinner
   * @default "sm"
   */
  spinnerSize?: "xs" | "sm" | "md" | "lg" | "xl";
}
const EMPTY_CLASS_NAMES: InputClassNames = {};

export const Input = ({
  className,
  type,
  leftIcon,
  rightIcon,
  leftItem,
  rightItem,
  classNames = EMPTY_CLASS_NAMES,
  isLoading = false,
  spinnerSize = "sm",
  disabled,
  iconClassName,
  ref,
  ...props
}: InputProps & {
  ref?: React.Ref<HTMLInputElement>;
}) => {
  // If loading, override left icon with spinner
  const effectiveLeftIcon = isLoading ? undefined : leftIcon;
  const effectiveLeftItem = isLoading ? (
    <Spinner size={spinnerSize} />
  ) : (
    leftItem
  );

  // Handle both explicit disabled prop and loading state
  const isDisabled = disabled || isLoading;
  const hasLeft = isLoading || effectiveLeftIcon || effectiveLeftItem;
  const hasRight = rightIcon || rightItem;
  const hasAffix = Boolean(hasLeft || hasRight);
  const inputElement = (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md bg-transparent px-3 py-1 text-base",
        "transition-[border-color,box-shadow] duration-200 ease-in-out",
        "file:text-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-muted-foreground",
        "focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "md:text-sm",
        hasLeft && "pl-1",
        hasRight && "pr-1",
        !hasAffix &&
          "border-input focus-visible:border-primary focus-visible:ring-primary border focus-visible:ring-1 focus-visible:outline-none",
        !hasAffix && className,
        classNames.input
      )}
      ref={ref}
      disabled={isDisabled}
      {...props}
    />
  );
  if (!hasAffix) {
    return inputElement;
  }
  return (
    <div
      className={cn(
        "border-input bg-background relative flex items-center rounded-md border",
        "transition-[border-color,box-shadow] duration-200 ease-in-out",
        "focus-within:border-primary focus-within:ring-primary focus-within:ring-1",
        isDisabled && "cursor-not-allowed opacity-50",
        classNames.container,
        className
      )}
    >
      <InputAffix
        icon={effectiveLeftIcon}
        item={effectiveLeftItem}
        className="flex items-center pl-3"
        iconClassName={cn(classNames.leftIcon, iconClassName)}
        itemClassName={classNames.leftItem}
      />
      {inputElement}
      <InputAffix
        icon={rightIcon}
        item={rightItem}
        className="flex items-center pr-3"
        iconClassName={cn(classNames.rightIcon, iconClassName)}
        itemClassName={classNames.rightItem}
      />
    </div>
  );
};
