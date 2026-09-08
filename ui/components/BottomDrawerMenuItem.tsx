"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

import type { ReactFC } from "@/ui/lib/types";
import { cn } from "@/ui/lib/utils";
import { HelpInfoCircle } from "@/ui/components/HelpInfoCircle";
import { MenuShortcut } from "@/ui/components/MenuShortcut";
import { useMenuContext } from "@/ui/components/MenuContext";

export interface BottomDrawerMenuItemProps {
  children: React.ReactNode;
  leftIcon?: LucideIcon | undefined;
  rightIcon?: LucideIcon | undefined;
  emoji?: string | undefined;
  className?: string | undefined;
  disabled?: boolean | undefined;
  destructive?: boolean | undefined;
  onClick?: ((event: React.MouseEvent<HTMLElement>) => void) | undefined;
  onBlur?: (() => void) | undefined;
  textClassName?: string | undefined;
  leftIconClassName?: string | undefined;
  rightIconClassName?: string | undefined;
  shortcutClassName?: string | undefined;
  hintClassName?: string | undefined;
  href?: string | undefined;
  external?: boolean | undefined;
  isLast?: boolean | undefined;
  shortcut?: string | string[] | undefined;
  hint?: string | undefined;
  closeOnClick?: boolean | undefined;
}
export const BottomDrawerMenuItem: ReactFC<BottomDrawerMenuItemProps> = ({
  children,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  emoji,
  className,
  disabled,
  destructive,
  onClick,
  onBlur,
  textClassName,
  leftIconClassName,
  rightIconClassName,
  shortcutClassName,
  hintClassName,
  href,
  external,
  isLast,
  shortcut,
  hint,
  closeOnClick = true,
}) => {
  const { closeMenu } = useMenuContext();
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
    if (closeOnClick && !event.defaultPrevented) {
      closeMenu?.();
    }
  };
  const iconClasses = cn(
    "h-5 w-5",
    "text-muted-foreground",
    destructive && "text-current",
  );
  const itemClasses = cn(
    "flex w-full min-w-0 cursor-pointer items-center gap-3 px-4 py-3 text-base",
    "transition-colors active:bg-zinc-50 dark:active:bg-zinc-800/50",
    "focus-visible:outline-ring justify-start text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px]",
    disabled && "pointer-events-none opacity-50",
    destructive && "text-red-600 dark:text-red-400",
    !isLast &&
      "border-zinc-100 dark:border-zinc-800 [&:has(+[data-slot=bottom-drawer-menu-item])]:border-b",
    className,
  );
  const content = (
    <>
      {emoji ? (
        <span className="inline-flex size-5 shrink-0 items-center justify-center text-base">
          {emoji}
        </span>
      ) : (
        LeftIcon && (
          <LeftIcon className={cn("shrink-0", iconClasses, leftIconClassName)} />
        )
      )}
      <span className={cn("min-w-0 flex-1", textClassName)}>{children}</span>
      {hint && (
        <span className={cn("inline-flex shrink-0 items-center", hintClassName)}>
          <HelpInfoCircle
            content={hint}
            drawerTitle="Help"
            iconClassName={destructive ? "text-current" : ""}
          />
        </span>
      )}
      {RightIcon && (
        <RightIcon className={cn("shrink-0", iconClasses, rightIconClassName)} />
      )}
      {shortcut && (
        <MenuShortcut
          shortcut={shortcut}
          destructive={destructive}
          className={shortcutClassName}
        />
      )}
    </>
  );
  if (href) {
    if (external) {
      return (
        <a
          data-slot="bottom-drawer-menu-item"
          onBlur={onBlur}
          aria-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : undefined}
          className={itemClasses}
          href={href}
          onClick={handleClick}
          rel="noopener noreferrer"
          target="_blank"
        >
          {content}
        </a>
      );
    }
    return (
      <Link
        data-slot="bottom-drawer-menu-item"
        onBlur={onBlur}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        className={itemClasses}
        href={href}
        onClick={handleClick}
      >
        {content}
      </Link>
    );
  }
  return (
    <button
      type="button"
      data-slot="bottom-drawer-menu-item"
      onBlur={onBlur}
      className={itemClasses}
      disabled={disabled}
      onClick={handleClick}
    >
      {content}
    </button>
  );
};
