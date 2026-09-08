"use client";

import * as React from "react";

import { useControlledOpen } from "@/registry/hooks/useControlledOpen";
import { useKitzeUI } from "@/registry/new-york/kitze-ui-context/KitzeUIContext";
import { ResponsiveSelectBottomDrawerMenu } from "@/registry/new-york/responsive-select-bottom-drawer-menu/ResponsiveSelectBottomDrawerMenu";
import { SimpleSelectNative } from "@/registry/new-york/simple-select/SimpleSelectNative";
import { SimpleSelectPopover } from "@/registry/new-york/simple-select/SimpleSelectPopover";
import { SimpleSelectTrigger } from "@/registry/new-york/simple-select/SimpleSelectTrigger";
import type * as SimpleSelectTypesModule from "@/registry/new-york/simple-select/SimpleSelectTypes";

export type SelectMobileViewType = SimpleSelectTypesModule.SelectMobileViewType;
export type SimpleSelectOption = SimpleSelectTypesModule.SimpleSelectOption;
export type SimpleSelectProps = SimpleSelectTypesModule.SimpleSelectProps;
export const SimpleSelect = ({
  options,
  value,
  onValueChange,
  placeholder = "Select an option",
  className,
  triggerClassName,
  disabled,
  withSearch = false,
  searchPlaceholder = "Search options...",
  mobileView = "keep",
  mobileViewSearch = false,
  drawerTitle = "Select an option",
}: SimpleSelectProps) => {
  const { isMobile } = useKitzeUI();
  const { isOpen, setIsOpen, close } = useControlledOpen({});
  const listId = React.useId();
  const selectedOption = options.find((option) => option.value === value);
  const triggerButton = (
    <SimpleSelectTrigger
      className={className}
      disabled={disabled}
      isOpen={isOpen}
      listId={listId}
      onClick={() => setIsOpen(!isOpen)}
      placeholder={placeholder}
      selectedOption={selectedOption}
      triggerClassName={triggerClassName}
      value={value}
    />
  );
  if (isMobile && mobileView === "native") {
    return (
      <SimpleSelectNative
        className={className}
        disabled={disabled}
        onValueChange={onValueChange}
        options={options}
        placeholder={placeholder}
        selectedOption={selectedOption}
        triggerClassName={triggerClassName}
        value={value}
      />
    );
  }
  if (isMobile && mobileView === "bottom-drawer") {
    return (
      <ResponsiveSelectBottomDrawerMenu
        options={options}
        value={value}
        onValueChange={(nextValue) => {
          onValueChange?.(nextValue);
          close();
        }}
        placeholder={placeholder}
        drawerTitle={drawerTitle}
        open={isOpen}
        onOpenChange={setIsOpen}
        searchPlaceholder={searchPlaceholder}
        showSearch={mobileViewSearch}
        triggerClassName={triggerClassName}
        className={className}
        disabled={disabled}
      >
        {triggerButton}
      </ResponsiveSelectBottomDrawerMenu>
    );
  }
  return (
    <SimpleSelectPopover
      className={className}
      listId={listId}
      onOpenChange={setIsOpen}
      onValueChange={onValueChange}
      open={isOpen}
      options={options}
      searchPlaceholder={searchPlaceholder}
      triggerButton={triggerButton}
      value={value}
      withSearch={withSearch}
    />
  );
};
