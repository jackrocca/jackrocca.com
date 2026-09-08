"use client";

import React from "react";
import type { FieldValues, FieldPath } from "react-hook-form";

import type { SelectOption } from "@/lib/types";
import { AdvancedSelect } from "@/registry/new-york/advanced-select/AdvancedSelect";
import type { FormFieldWrapperProps } from "@/registry/new-york/form-field-wrapper/FormFieldWrapper";
import { FormFieldWrapper } from "@/registry/new-york/form-field-wrapper/FormFieldWrapper";

export interface FormFieldAdvancedSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<FormFieldWrapperProps<TFieldValues, TName>, "children"> {
  options: SelectOption[];
  placeholder?: string | undefined;
  searchable?: boolean | undefined;
  maxCount?: number | undefined;
  variant?: "default" | "secondary" | "destructive" | "inverted" | undefined;
  disabled?: boolean | undefined;
}
export const FormFieldAdvancedSelect = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  options,
  placeholder,
  searchable = false,
  maxCount,
  variant,
  disabled,
  ...wrapperProps
}: FormFieldAdvancedSelectProps<TFieldValues, TName>) => (
  <FormFieldWrapper<TFieldValues, TName> {...wrapperProps}>
    {(field) => (
      <AdvancedSelect
        options={options}
        value={field.value || []}
        onValueChange={(value) => field.onChange(value)}
        placeholder={placeholder}
        searchable={searchable}
        maxCount={maxCount}
        variant={variant}
        disabled={disabled}
      />
    )}
  </FormFieldWrapper>
);
