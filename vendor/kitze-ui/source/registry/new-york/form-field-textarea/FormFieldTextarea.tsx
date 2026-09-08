"use client";

import React from "react";
import type { FieldValues, FieldPath } from "react-hook-form";

import { Textarea } from "@/components/ui/textarea";
import type { FormFieldWrapperProps } from "@/registry/new-york/form-field-wrapper/FormFieldWrapper";
import { FormFieldWrapper } from "@/registry/new-york/form-field-wrapper/FormFieldWrapper";

export interface FormFieldTextareaProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<FormFieldWrapperProps<TFieldValues, TName>, "children"> {
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}
export const FormFieldTextarea = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  placeholder,
  rows,
  disabled,
  ...wrapperProps
}: FormFieldTextareaProps<TFieldValues, TName>) => (
  <FormFieldWrapper<TFieldValues, TName> {...wrapperProps}>
    {(field) => (
      <Textarea
        placeholder={placeholder}
        rows={rows}
        {...field}
        disabled={disabled}
      />
    )}
  </FormFieldWrapper>
);
