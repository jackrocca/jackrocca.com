"use client";

import type { LucideIcon } from "lucide-react";
import React from "react";
import type { VariantProps } from "tailwind-variants";

import type { SelectOption } from "@/ui/lib/types";
import { cn } from "@/ui/lib/utils";
import { ConditionalTooltip } from "@/ui/components/ConditionalTooltip";
import { useKitzeUI } from "@/ui/components/KitzeUIContext";
import {
  segmentedControl,
  segmentedItem,
  iconSize,
  handleSegmentKey,
} from "@/ui/components/SegmentedControlStyles";
import type { SelectMobileViewType } from "@/ui/components/SimpleSelect";
import { SimpleSelect } from "@/ui/components/SimpleSelect";

export type SegmentedControlMobileViewType = "keep" | SelectMobileViewType;
export interface SegmentedControlOption {
  value: string;
  label: string;
  icon?: LucideIcon | undefined;
  tooltip?: string | undefined;
  leftIcon?: LucideIcon | undefined;
  rightIcon?: LucideIcon | undefined;
  leftSide?: React.ComponentType | undefined;
  rightSide?: React.ComponentType | undefined;
  disabled?: boolean | undefined;
}
export interface SegmentedControlProps extends VariantProps<typeof segmentedControl> {
  options: SegmentedControlOption[];
  /** Hide visible labels on options with icons; labels remain accessible. */
  iconOnly?: boolean | undefined;
  value: string;
  onChange: (value: string) => void;
  className?: string | undefined;
  tabClassName?: string | undefined;
  activeTabClassName?: string | undefined;
  mobileView?: SegmentedControlMobileViewType | undefined;
  mobileViewSearch?: boolean | undefined;
  drawerTitle?: string | undefined;
  placeholder?: string | undefined;
  disabled?: boolean | undefined;
}
export const SegmentedControl = ({
  options,
  iconOnly = false,
  value,
  onChange,
  className,
  tabClassName,
  activeTabClassName,
  size = "md",
  mobileView = "keep",
  mobileViewSearch = false,
  drawerTitle = "Select an option",
  placeholder = "Select an option",
  disabled,
}: SegmentedControlProps) => {
  const { isMobile } = useKitzeUI();
  const listRef = React.useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = React.useState<{ x: number; w: number } | null>(null);
  React.useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const sync = () => {
      const btn = el.querySelector<HTMLButtonElement>('button[aria-selected="true"]');
      if (btn) setThumb({ x: btn.offsetLeft, w: btn.offsetWidth });
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [value]);

  if (isMobile && mobileView !== "keep") {
    const selectOptions: SelectOption[] = options.map((option) => ({
      disabled: disabled || option.disabled,
      icon: option.icon ?? option.leftIcon,
      label: option.label,
      value: option.value,
    }));
    return (
      <SimpleSelect
        options={selectOptions}
        value={value}
        onValueChange={onChange}
        placeholder={placeholder}
        className={className}
        mobileView={mobileView}
        mobileViewSearch={mobileViewSearch}
        drawerTitle={drawerTitle}
        disabled={disabled}
      />
    );
  }

  return (
    <div
      ref={listRef}
      className={segmentedControl({
        className,
        size,
      })}
      role="tablist"
      aria-orientation="horizontal"
    >
      {thumb ? (
        <span
          aria-hidden
          className="pointer-events-none absolute top-1 bottom-1 left-0 rounded-sm bg-background shadow-sm transition-[transform,width] duration-200 motion-reduce:transition-none"
          style={{ transform: `translateX(${thumb.x}px)`, width: thumb.w }}
        />
      ) : null}
      {options.map((option) => {
        const isActive = option.value === value;
        const LeftIcon = option.icon ?? option.leftIcon;
        const RightIcon = option.rightIcon;
        const LeftSide = option.leftSide;
        const RightSide = option.rightSide;
        const hideLabel = iconOnly && Boolean(LeftIcon || RightIcon);
        return (
          <ConditionalTooltip
            key={option.value}
            condition={Boolean(option.tooltip)}
            content={option.tooltip}
          >
            <button
              type="button"
              role="tab"
              tabIndex={isActive ? 0 : -1}
              onKeyDown={handleSegmentKey}
              onClick={() => !disabled && !option.disabled && onChange(option.value)}
              className={cn(
                segmentedItem({
                  active: isActive,
                  size,
                }),
                "relative gap-2",
                hideLabel && "aspect-square px-2",
                tabClassName,
                isActive && activeTabClassName,
              )}
              aria-label={hideLabel ? option.label : undefined}
              aria-selected={isActive}
              disabled={disabled || option.disabled}
            >
              {LeftSide && <LeftSide />}
              {LeftIcon && (
                <LeftIcon aria-hidden="true" className={iconSize[size || "md"]} />
              )}
              <span className={hideLabel ? "sr-only" : undefined}>{option.label}</span>
              {RightIcon && (
                <RightIcon aria-hidden="true" className={iconSize[size || "md"]} />
              )}
              {RightSide && <RightSide />}
            </button>
          </ConditionalTooltip>
        );
      })}
    </div>
  );
};
