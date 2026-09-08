"use client";

import type { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import * as React from "react";
import { useState } from "react";

import type {
  SegmentedControlOption,
  SegmentedControlMobileViewType,
} from "@/registry/new-york/segmented-control/SegmentedControl";
import { SegmentedControl } from "@/registry/new-york/segmented-control/SegmentedControl";

export interface TabPanelProps {
  value: string;
  label: string;
  icon: LucideIcon;
  content: React.ReactNode;
}
export interface TabPanelsProps {
  tabs: TabPanelProps[];
  defaultTab?: string;
  title?: string;
  // For controlled usage
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  // Mobile view props for SegmentedControl
  mobileView?: SegmentedControlMobileViewType;
  drawerTitle?: string;
  placeholder?: string;
}
export const TabPanels = ({
  tabs,
  defaultTab,
  title,
  activeTab: controlledActiveTab,
  onTabChange,
  mobileView,
  drawerTitle,
  placeholder,
}: TabPanelsProps) => {
  const [firstTab] = tabs;
  const initialTab =
    defaultTab && tabs.some((tab) => tab.value === defaultTab)
      ? defaultTab
      : (firstTab?.value ?? "");
  const [internalActiveTab, setInternalActiveTab] =
    useState<string>(initialTab);
  const isControlled = controlledActiveTab !== undefined;
  const activeTab = isControlled ? controlledActiveTab : internalActiveTab;
  if (!firstTab) {
    return null;
  }
  const tabOptions: SegmentedControlOption[] = tabs.map((tab) => ({
    label: tab.label,
    leftIcon: tab.icon,
    value: tab.value,
  }));
  const handleTabChange = (value: string) => {
    if (!isControlled) {
      setInternalActiveTab(value);
    }
    if (onTabChange) {
      onTabChange(value);
    }
  };
  const activeTabContent =
    tabs.find((tab) => tab.value === activeTab)?.content || firstTab.content;
  return (
    <div className="vertical gap-6">
      {title && <div className="text-2xl font-semibold">{title}</div>}

      <SegmentedControl
        options={tabOptions}
        value={activeTab}
        onChange={handleTabChange}
        size="md"
        className="w-full"
        mobileView={mobileView}
        drawerTitle={drawerTitle}
        placeholder={placeholder}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{
            opacity: 0,
            x: 20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          exit={{
            opacity: 0,
            x: -20,
          }}
          transition={{
            duration: 0.25,
            ease: "easeInOut",
          }}
        >
          {activeTabContent}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
