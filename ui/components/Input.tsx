"use client";

import type { ElementType, InputHTMLAttributes, ReactNode } from "react";
import React from "react";

import { cn } from "@/ui/lib/utils";
import { Input as PrimitiveInput } from "@/ui/primitives/input";
import { InputAffix } from "@/ui/components/InputAffix";
import { Spinner } from "@/ui/components/Spinner";

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
  const effectiveLeftIcon = isLoading ? undefined : leftIcon;
  const effectiveLeftItem = isLoading ? <Spinner size={spinnerSize} /> : leftItem;
  const isDisabled = disabled || isLoading;
  const hasLeft = isLoading || effectiveLeftIcon || effectiveLeftItem;
  const hasRight = rightIcon || rightItem;
  const hasAffix = Boolean(hasLeft || hasRight);
  const inputElement = (
    <PrimitiveInput
      type={type}
      className={cn(
        hasLeft && "pl-1",
        hasRight && "pr-1",
        hasAffix &&
          "flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0",
        !hasAffix && className,
        classNames.input,
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
        "relative flex h-8 w-full min-w-0 items-center rounded-lg border border-input bg-transparent",
        "has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50",
        isDisabled && "cursor-not-allowed opacity-50",
        classNames.container,
        className,
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
