"use client";

import type { LucideIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/ui/lib/utils";
import { Tabs, TabsIndicator, TabsList, TabsPanel, TabsTab } from "@/ui/primitives/tabs";

// Local adaptation of the upstream tab-panels item: Base UI Tabs for keyboard and
// aria wiring, a transform-only sliding indicator, and an opacity-only panel entry
// instead of the upstream Motion slide, so no animation library is required.
export interface TabPanelProps {
  value: string;
  label: string;
  icon?: LucideIcon | undefined;
  /** Small trailing count or badge. */
  badge?: React.ReactNode;
  disabled?: boolean | undefined;
  content: React.ReactNode;
}
export interface TabPanelsClassNames {
  root?: string | undefined;
  list?: string | undefined;
  tab?: string | undefined;
  indicator?: string | undefined;
  panel?: string | undefined;
}
export interface TabPanelsProps {
  tabs: TabPanelProps[];
  defaultTab?: string | undefined;
  activeTab?: string | undefined;
  onTabChange?: ((tab: string) => void) | undefined;
  /** Keep inactive panels mounted (for example to preserve scroll or fetch state). */
  keepMounted?: boolean | undefined;
  classNames?: TabPanelsClassNames | undefined;
  "aria-label"?: string | undefined;
}
export const TabPanels = ({
  tabs,
  defaultTab,
  activeTab,
  onTabChange,
  keepMounted = false,
  classNames,
  "aria-label": ariaLabel,
}: TabPanelsProps) => {
  const [firstTab] = tabs;
  const [internal, setInternal] = React.useState<string>(
    defaultTab && tabs.some((tab) => tab.value === defaultTab)
      ? defaultTab
      : (firstTab?.value ?? ""),
  );
  const value = activeTab ?? internal;
  if (!firstTab) {
    return null;
  }
  return (
    <Tabs
      value={value}
      onValueChange={(next) => {
        const nextValue = String(next);
        if (activeTab === undefined) {
          setInternal(nextValue);
        }
        onTabChange?.(nextValue);
      }}
      className={classNames?.root}
    >
      <TabsList aria-label={ariaLabel} className={classNames?.list}>
        {tabs.map(({ value: tabValue, label, icon: Icon, badge, disabled }) => (
          <TabsTab
            key={tabValue}
            value={tabValue}
            disabled={disabled}
            className={classNames?.tab}
          >
            {Icon && <Icon aria-hidden="true" className="h-4 w-4" />}
            <span>{label}</span>
            {badge}
          </TabsTab>
        ))}
        <TabsIndicator className={classNames?.indicator} />
      </TabsList>
      {tabs.map(({ value: tabValue, content }) => (
        <TabsPanel
          key={tabValue}
          value={tabValue}
          keepMounted={keepMounted}
          className={cn(
            "transition-opacity duration-150 ease-out starting:opacity-0 motion-reduce:transition-none",
            classNames?.panel,
          )}
        >
          {content}
        </TabsPanel>
      ))}
    </Tabs>
  );
};
