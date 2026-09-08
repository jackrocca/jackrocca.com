"use client";

import React from "react";
import type { FieldValues, FieldPath } from "react-hook-form";

import { Input } from "@/components/ui/input";
import type { FormFieldWrapperProps } from "@/registry/new-york/form-field-wrapper/FormFieldWrapper";
import { FormFieldWrapper } from "@/registry/new-york/form-field-wrapper/FormFieldWrapper";

export interface FormFieldInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<FormFieldWrapperProps<TFieldValues, TName>, "children"> {
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}
export const FormFieldInput = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  placeholder,
  type = "text",
  disabled,
  ...wrapperProps
}: FormFieldInputProps<TFieldValues, TName>) => (
  <FormFieldWrapper<TFieldValues, TName> {...wrapperProps}>
    {(field) => (
      <Input
        type={type}
        placeholder={placeholder}
        {...field}
        disabled={disabled}
      />
    )}
  </FormFieldWrapper>
);
