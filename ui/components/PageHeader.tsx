"use client";

import { LucideMenu } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import type { ReactFC } from "@/ui/lib/types";
import { cn } from "@/ui/lib/utils";
import { useScrolledPast } from "@/ui/hooks/useScrolledPast";
import { BottomDrawer } from "@/ui/components/BottomDrawer";
import { CustomButton } from "@/ui/components/CustomButton";

export interface PageHeaderClassNames {
  root?: string;
  container?: string;
  leftSide?: string;
  middle?: string;
  rightSide?: string;
  menuButton?: string;
  pastScrolled?: string;
}

export interface PageHeaderProps {
  leftSide?: ReactNode;
  middle?: ReactNode;
  drawerContent?: ReactNode | undefined;
  classNames?: PageHeaderClassNames;
  height?: number;
  fixedOnScroll?: boolean;
  renderRightSide?: (props: {
    menuButton: ReactNode;
    bottomDrawer: (children: ReactNode) => ReactNode;
  }) => ReactNode;
}

export const PageHeader: ReactFC<PageHeaderProps> = ({
  leftSide,
  middle,
  drawerContent,
  classNames,
  renderRightSide,
  height = 80,
  fixedOnScroll = false,
}) => {
  const isScrolled = useScrolledPast(height);
  const [isOpen, setIsOpen] = useState(false);

  const menuButton = (
    <CustomButton
      variant="ghost"
      leftIcon={LucideMenu}
      className={cn(classNames?.menuButton)}
      aria-label="Menu"
      iconSize={20}
    />
  );

  const bottomDrawer = (children: ReactNode) => (
    <BottomDrawer
      title="Navigation"
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={menuButton}
    >
      {children}
    </BottomDrawer>
  );

  const applyFixed = fixedOnScroll ? isScrolled : false;

  return (
    <div
      style={{
        height,
      }}
      className={cn(
        "z-30 flex w-full items-center justify-between",
        "backdrop-blur-xl",
        "text-foreground/80",
        {
          "r-0 dark:bg-background/80 fixed top-0 left-0 shadow-sm": applyFixed,
        },
        classNames?.root,
      )}
    >
      <div
        className={cn(
          "flex w-full max-w-[1200px] items-center justify-between px-4 py-3",
          classNames?.container,
        )}
      >
        <div className={cn("flex-1", classNames?.leftSide)}>{leftSide}</div>

        {middle && (
          <div className={cn("flex-1 text-center", classNames?.middle)}>{middle}</div>
        )}

        <div className={cn("flex flex-1 justify-end", classNames?.rightSide)}>
          {renderRightSide?.({ bottomDrawer, menuButton }) ??
            (drawerContent ? bottomDrawer(drawerContent) : null)}
        </div>
      </div>
    </div>
  );
};
