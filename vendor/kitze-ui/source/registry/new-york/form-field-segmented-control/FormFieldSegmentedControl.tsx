import React from "react";
import type { FieldValues, FieldPath } from "react-hook-form";

import type { FormFieldWrapperProps } from "@/registry/new-york/form-field-wrapper/FormFieldWrapper";
import { FormFieldWrapper } from "@/registry/new-york/form-field-wrapper/FormFieldWrapper";
import type {
  SegmentedControlOption,
  SegmentedControlProps,
} from "@/registry/new-york/segmented-control/SegmentedControl";
import { SegmentedControl } from "@/registry/new-york/segmented-control/SegmentedControl";

export interface FormFieldSegmentedControlProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<FormFieldWrapperProps<TFieldValues, TName>, "children"> {
  options: SegmentedControlOption[];
  size?: SegmentedControlProps["size"] | undefined;
  className?: string | undefined;
  tabClassName?: string | undefined;
  activeTabClassName?: string | undefined;
  mobileView?: SegmentedControlProps["mobileView"] | undefined;
  mobileViewSearch?: boolean | undefined;
  drawerTitle?: string | undefined;
  placeholder?: string | undefined;
  disabled?: boolean | undefined;
}
export const FormFieldSegmentedControl = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  options,
  size,
  className,
  tabClassName,
  activeTabClassName,
  mobileView,
  mobileViewSearch,
  drawerTitle,
  placeholder,
  disabled,
  ...wrapperProps
}: FormFieldSegmentedControlProps<TFieldValues, TName>) => (
  <FormFieldWrapper<TFieldValues, TName> {...wrapperProps}>
    {(field) => (
      <SegmentedControl
        options={options}
        value={field.value}
        onChange={(value) => field.onChange(value)}
        size={size}
        className={className}
        tabClassName={tabClassName}
        activeTabClassName={activeTabClassName}
        mobileView={mobileView}
        mobileViewSearch={mobileViewSearch}
        drawerTitle={drawerTitle}
        placeholder={placeholder}
        disabled={disabled}
      />
    )}
  </FormFieldWrapper>
);
