"use client";

import * as React from "react";

import type { AdvancedSelectOption } from "@/registry/new-york/advanced-select/AdvancedSelectTypes";
import { getFilteredOptions } from "@/registry/new-york/advanced-select/AdvancedSelectUtils";

export const useAdvancedSelectState = ({
  controlledValue,
  defaultValue,
  maxCount,
  onCreate,
  onValueChange,
  options,
  searchable,
}: {
  controlledValue?: string[] | undefined;
  defaultValue: string[];
  maxCount: number;
  onCreate?: ((value: string) => void) | undefined;
  onValueChange?: ((value: string[]) => void) | undefined;
  options: AdvancedSelectOption[];
  searchable: boolean;
}) => {
  const [internalSelectedValues, setInternalSelectedValues] = React.useState<
    string[]
  >(controlledValue || defaultValue);
  const selectedValues = controlledValue ?? internalSelectedValues;

  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const updateValues = (newValues: string[]) => {
    if (controlledValue === undefined) {
      setInternalSelectedValues(newValues);
    }
    onValueChange?.(newValues);
  };

  const toggleOption = (option: string) => {
    const newSelectedValues = selectedValues.includes(option)
      ? selectedValues.filter((value) => value !== option)
      : [...selectedValues, option];
    updateValues(newSelectedValues);
  };

  const handleClear = () => updateValues([]);
  const handleTogglePopover = () => setIsPopoverOpen((previous) => !previous);
  const clearExtraOptions = () =>
    updateValues(selectedValues.slice(0, maxCount));
  const toggleAll = () => {
    if (selectedValues.length === options.length) {
      handleClear();
    } else {
      updateValues(options.map((option) => option.value));
    }
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setIsPopoverOpen(true);
    } else if (event.key === "Backspace" && !event.currentTarget.value) {
      const newSelectedValues = [...selectedValues];
      newSelectedValues.pop();
      updateValues(newSelectedValues);
    }
  };

  const handleOptionClick = (optionValue: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toggleOption(optionValue);
  };
  const handleSelectAllClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toggleAll();
  };
  const handleClearClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    handleClear();
  };
  const handleCloseClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsPopoverOpen(false);
  };
  const handleMiddleClick = (
    value: string,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (event.button === 1) {
      event.preventDefault();
      toggleOption(value);
    }
  };
  const handleCreateOption = () => {
    if (onCreate && searchQuery.trim()) {
      onCreate(searchQuery.trim());
      setSearchQuery("");
    }
  };
  const optionsByValue = React.useMemo(
    () => new Map(options.map((option) => [option.value, option])),
    [options]
  );

  return {
    clearExtraOptions,
    filteredOptions: getFilteredOptions(options, searchable, searchQuery),
    handleClearClick,
    handleCloseClick,
    handleCreateOption,
    handleInputKeyDown,
    handleMiddleClick,
    handleOptionClick,
    handleSearchChange: setSearchQuery,
    handleSelectAllClick,
    handleTogglePopover,
    isPopoverOpen,
    optionsByValue,
    searchQuery,
    selectedValues,
    setIsPopoverOpen,
    toggleOption,
  };
};
