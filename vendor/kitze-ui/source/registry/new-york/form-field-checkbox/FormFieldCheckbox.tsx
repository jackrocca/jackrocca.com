import React from "react";
import type { FieldValues, FieldPath } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { FormFieldWrapperProps } from "@/registry/new-york/form-field-wrapper/FormFieldWrapper";
import { FormFieldWrapper } from "@/registry/new-york/form-field-wrapper/FormFieldWrapper";

export interface FormFieldCheckboxProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<
  FormFieldWrapperProps<TFieldValues, TName>,
  "children" | "label"
> {
  label: React.ReactNode;
  checkboxClassName?: string;
}
export const FormFieldCheckbox = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  label,
  checkboxClassName,
  ...wrapperProps
}: FormFieldCheckboxProps<TFieldValues, TName>) => (
  <FormFieldWrapper<TFieldValues, TName> {...wrapperProps} label={undefined}>
    {(field) => (
      <div className="flex items-center space-x-2">
        <Checkbox
          id={field.name}
          checked={field.value}
          onCheckedChange={(value) => field.onChange(value)}
          onBlur={() => field.onBlur()}
          name={field.name}
          ref={field.ref}
          required={wrapperProps.required}
          aria-describedby={
            wrapperProps.description ? `${field.name}-description` : undefined
          }
          className={cn(checkboxClassName)}
        />
        <Label
          htmlFor={field.name}
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
          {wrapperProps.required && (
            <span className="text-destructive ml-1">*</span>
          )}
        </Label>
      </div>
    )}
  </FormFieldWrapper>
);
