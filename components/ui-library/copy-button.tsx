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
  const Idle = iconOnly ? (icon ?? Copy) : (leftIcon ?? Clipboard);
  const t =
    "size-4 transition-[opacity,scale] duration-150 motion-reduce:transition-none";
  const stack = (
    <span className="grid place-items-center [&>*]:col-start-1 [&>*]:row-start-1">
      <Idle
        aria-hidden
        className={`${t} ${status === "copied" ? "opacity-0 scale-75" : "opacity-100 scale-100"}`}
      />
      <Check
        aria-hidden
        className={`${t} ${status === "copied" ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
      />
    </span>
  );
  const name = status === "failed" ? "Copy failed" : (ariaLabel ?? label);

  return (
    <CustomButton
      type="button"
      variant={variant}
      size={size}
      circle={iconOnly ? circle : undefined}
      color={color}
      className={className}
      leftSide={iconOnly ? undefined : stack}
      aria-label={name}
      tooltip={iconOnly ? tooltip : undefined}
      onClick={() => void copy(typeof text === "function" ? text() : text)}
    >
      {iconOnly ? (
        stack
      ) : (
        <span style={{ minWidth: `${Math.max(label.length, 6)}ch` }}>{display}</span>
      )}
    </CustomButton>
  );
}
