import type { AdvancedSelectOption } from "@/registry/new-york/advanced-select/AdvancedSelectTypes";

export const getFilteredOptions = (
  options: AdvancedSelectOption[],
  searchable: boolean,
  searchQuery: string
) => {
  if (!(searchable && searchQuery)) {
    return options;
  }

  return options.filter((option) =>
    (option.label || option.value)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );
};

export const optionMatchesSearch = (
  option: AdvancedSelectOption,
  normalizedQuery: string
) =>
  option.label?.toLowerCase() === normalizedQuery ||
  option.value.toLowerCase() === normalizedQuery;
