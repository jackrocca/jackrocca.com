"use client";

import React from "react";
import type {
  FieldValues,
  FieldPath,
  FieldPathValue,
  ControllerRenderProps,
} from "react-hook-form";
import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

export interface FormFieldWrapperProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
  label?: React.ReactNode | undefined;
  renderLabel?: (() => React.ReactNode) | undefined;
  description?: React.ReactNode | undefined;
  className?: string | undefined;
  required?: boolean | undefined;
  defaultValue?: FieldPathValue<TFieldValues, TName> | undefined;
  children: (
    field: ControllerRenderProps<TFieldValues, TName>
  ) => React.ReactNode;
}
export const FormFieldWrapper = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  renderLabel,
  description,
  className,
  required,
  defaultValue,
  children,
}: FormFieldWrapperProps<TFieldValues, TName>) => {
  const form = useFormContext<TFieldValues>();
  const defaultLabel = label && (
    <FormLabel>
      {label}
      {required && <span className="text-destructive ml-1">*</span>}
    </FormLabel>
  );
  const labelContent = renderLabel ? renderLabel() : defaultLabel;
  return (
    <FormField
      control={form.control}
      name={name}
      {...(defaultValue === undefined ? {} : { defaultValue })}
      render={({ field }) => {
        const control = children(field);
        return (
          <FormItem className={cn("flex flex-col gap-0", className)}>
            {labelContent}
            <FormControl
              render={
                React.isValidElement(control) ? control : <span>{control}</span>
              }
            />
            {description && <FormDescription>{description}</FormDescription>}
            <div data-slot="form-message-slot" className="min-h-5">
              <FormMessage />
            </div>
          </FormItem>
        );
      }}
    />
  );
};
