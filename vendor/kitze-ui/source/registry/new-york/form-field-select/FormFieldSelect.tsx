import React from "react";
import type { FieldValues, FieldPath } from "react-hook-form";

import type { FormFieldWrapperProps } from "@/registry/new-york/form-field-wrapper/FormFieldWrapper";
import { FormFieldWrapper } from "@/registry/new-york/form-field-wrapper/FormFieldWrapper";
import type { SimpleSelectOption } from "@/registry/new-york/simple-select/SimpleSelect";
import { SimpleSelect } from "@/registry/new-york/simple-select/SimpleSelect";

export interface FormFieldSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<FormFieldWrapperProps<TFieldValues, TName>, "children"> {
  options: SimpleSelectOption[];
  placeholder?: string | undefined;
  triggerClassName?: string | undefined;
  disabled?: boolean | undefined;
}
export const FormFieldSelect = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  options,
  placeholder,
  triggerClassName,
  disabled,
  ...wrapperProps
}: FormFieldSelectProps<TFieldValues, TName>) => (
  <FormFieldWrapper<TFieldValues, TName> {...wrapperProps}>
    {(field) => (
      <SimpleSelect
        options={options}
        value={field.value}
        onValueChange={(value) => field.onChange(value)}
        placeholder={placeholder}
        triggerClassName={triggerClassName}
        disabled={disabled}
      />
    )}
  </FormFieldWrapper>
);
