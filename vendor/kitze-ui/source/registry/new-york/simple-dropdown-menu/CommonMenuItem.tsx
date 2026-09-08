"use client";

import type { LucideIcon } from "lucide-react";
import React from "react";

import { ContextMenuItem } from "@/components/ui/context-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { ReactFC } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { LinkableProps } from "@/registry/hooks/useLinkableComponent";
import { useLinkableComponent } from "@/registry/hooks/useLinkableComponent";
import { BottomDrawerMenuItem } from "@/registry/new-york/bottom-drawer/BottomDrawerMenuItem";
import { HelpInfoCircle } from "@/registry/new-york/help-info-circle/HelpInfoCircle";
import { MenuShortcut } from "@/registry/new-york/kbd-shortcuts/MenuShortcut";
import { useMenuContext } from "@/registry/new-york/menu-context/MenuContext";

export interface CommonMenuItemProps extends LinkableProps {
  children: React.ReactNode;
  shortcut?: string | string[];
  hint?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  className?: string;
  rootClassName?: string;
  textClassName?: string;
  leftIconClassName?: string;
  rightIconClassName?: string;
  shortcutClassName?: string;
  hintClassName?: string;
  disabled?: boolean;
  destructive?: boolean;
  onSelect?: (event: React.MouseEvent<HTMLElement>) => void;
  onBlur?: () => void;
  closeOnClick?: boolean;
  isLast?: boolean;
  href?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  external?: boolean;
}

export const CommonMenuItem: ReactFC<CommonMenuItemProps> = ({
  children,
  shortcut,
  hint,
  leftIcon,
  rightIcon,
  className,
  rootClassName,
  textClassName,
  leftIconClassName,
  rightIconClassName,
  shortcutClassName,
  hintClassName,
  disabled,
  destructive,
  onSelect,
  onBlur,
  closeOnClick = true,
  isLast,
  onClick,
  external,
  ...rest
}) => {
  const { menuType, closeMenu } = useMenuContext();
  const { Component, href, linkProps } = useLinkableComponent({
    ...rest,
    external,
  });

  // Handle click with menu closing
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onSelect?.(event);
    if (!event.defaultPrevented) {
      onClick?.(event);
    }
    if (closeOnClick && !event.defaultPrevented) {
      closeMenu?.();
    }
  };

  // If we're in a bottom drawer, render the BottomDrawerMenuItem
  if (menuType === "bottom-drawer") {
    return (
      <BottomDrawerMenuItem
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        className={cn(className, rootClassName)}
        disabled={disabled}
        destructive={destructive}
        onClick={handleClick}
        onBlur={onBlur}
        closeOnClick={false}
        textClassName={textClassName}
        leftIconClassName={leftIconClassName}
        rightIconClassName={rightIconClassName}
        shortcutClassName={shortcutClassName}
        hintClassName={hintClassName}
        href={rest.href}
        external={external}
        isLast={isLast}
        shortcut={shortcut}
        hint={hint}
      >
        {children}
      </BottomDrawerMenuItem>
    );
  }

  // For dropdown and context menus, use the existing implementation
  const MenuItem = menuType === "dropdown" ? DropdownMenuItem : ContextMenuItem;

  const iconClasses = cn(
    "size-5",
    "text-muted-foreground group-hover:text-current",
    destructive && "text-current"
  );

  const itemClasses = cn(
    className,
    rootClassName,
    destructive && "text-red-600 dark:text-red-400"
  );

  const content = (
    <>
      {leftIcon &&
        React.createElement(leftIcon, {
          className: cn(iconClasses, leftIconClassName),
        })}
      <span className={cn("min-w-0 flex-1", textClassName)}>{children}</span>
      {hint && (
        <span
          className={cn("inline-flex shrink-0 items-center", hintClassName)}
        >
          <HelpInfoCircle
            content={hint}
            iconClassName={cn("h-3.5 w-3.5", destructive && "text-current")}
          />
        </span>
      )}
      {rightIcon &&
        React.createElement(rightIcon, {
          className: cn(iconClasses, rightIconClassName),
        })}
      {shortcut && (
        <MenuShortcut
          shortcut={shortcut}
          destructive={destructive}
          className={shortcutClassName}
        />
      )}
    </>
  );

  return (
    <MenuItem
      className={cn(itemClasses, "group")}
      disabled={disabled}
      variant={destructive ? "destructive" : "default"}
      closeOnClick={false}
      onBlur={onBlur}
      onClick={handleClick}
      render={
        href && Component !== "div" ? (
          <Component href={href} {...linkProps} />
        ) : undefined
      }
    >
      {content}
    </MenuItem>
  );
};
