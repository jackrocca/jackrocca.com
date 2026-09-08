"use client";

import * as React from "react";

import { useControlledOpen } from "@/ui/hooks/useControlledOpen";
import { useKitzeUI } from "@/ui/components/KitzeUIContext";
import { ResponsiveSelectBottomDrawerMenu } from "@/ui/components/ResponsiveSelectBottomDrawerMenu";
import { SimpleSelectNative } from "@/ui/components/SimpleSelectNative";
import { SimpleSelectPopover } from "@/ui/components/SimpleSelectPopover";
import { SimpleSelectTrigger } from "@/ui/components/SimpleSelectTrigger";
import type * as SimpleSelectTypesModule from "@/ui/components/SimpleSelectTypes";

export type SelectMobileViewType = SimpleSelectTypesModule.SelectMobileViewType;
export type SimpleSelectOption = SimpleSelectTypesModule.SimpleSelectOption;
export type SimpleSelectProps = SimpleSelectTypesModule.SimpleSelectProps;
export const SimpleSelect = ({
  id,
  "aria-label": ariaLabel,
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
      id={id}
      ariaLabel={ariaLabel}
      className={className}
      disabled={disabled}
      isOpen={isOpen}
      listId={listId}
      // The popover owns pointer toggling; a second click handler closes it immediately.
      onClick={
        isMobile && mobileView === "bottom-drawer" ? () => setIsOpen(!isOpen) : undefined
      }
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
