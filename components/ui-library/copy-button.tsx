"use client";

import { useCallback, useState } from "react";
import { Check, Clipboard, Copy, type LucideIcon } from "lucide-react";
import { CustomButton } from "@/ui/components/CustomButton";
import type { CustomButtonProps } from "@/ui/components/CustomButton";

const RESET_MS = 1500;

export function useClipboardText() {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const copy = useCallback(async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    window.setTimeout(() => setStatus("idle"), RESET_MS);
  }, []);
  return { status, copy };
}

export function CopyButton({
  text,
  label = "Copy",
  variant = "outline",
  size = "sm",
  circle,
  icon,
  leftIcon,
  color,
  className,
  tooltip,
  "aria-label": ariaLabel,
}: {
  text: string | (() => string);
  label?: string;
  variant?: CustomButtonProps["variant"];
  size?: CustomButtonProps["size"];
  circle?: boolean;
  icon?: LucideIcon;
  leftIcon?: LucideIcon;
  color?: string;
  className?: string;
  tooltip?: string;
  "aria-label"?: string;
}) {
  const { status, copy } = useClipboardText();
  const iconOnly = Boolean(circle || icon) && status !== "failed";
  const display =
    status === "copied" ? "Copied" : status === "failed" ? "Copy failed" : label;
  const Left = status === "copied" ? Check : (leftIcon ?? Clipboard);
  const Only = status === "copied" ? Check : (icon ?? Copy);
  const name = status === "failed" ? "Copy failed" : (ariaLabel ?? label);

  return (
    <CustomButton
      type="button"
      variant={variant}
      size={size}
      circle={iconOnly ? circle : undefined}
      color={color}
      className={className}
      icon={iconOnly ? Only : undefined}
      leftIcon={iconOnly ? undefined : Left}
      aria-label={name}
      tooltip={iconOnly ? tooltip : undefined}
      onClick={() => void copy(typeof text === "function" ? text() : text)}
    >
      {iconOnly ? null : display}
    </CustomButton>
  );
}
