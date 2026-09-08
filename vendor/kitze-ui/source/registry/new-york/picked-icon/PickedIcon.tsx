"use client";

import type { IconifyIcon } from "@iconify/react";
import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";
import type { IconValue } from "@/registry/new-york/picked-icon/icon-types";
import { IconGlyph } from "@/registry/new-york/picked-icon/IconGlyph";

export interface PickedIconProps {
  value: IconValue;
  size?: number;
  label?: string | undefined;
  className?: string;
  /** Supply preloaded SVG data for SSR or offline rendering. No API request is made. */
  iconData?: IconifyIcon;
}
const frames = { circle: "50%", rounded: "22%", square: "0", squircle: "50%" };
export const PickedIcon = ({
  value,
  size = 36,
  label,
  className,
  iconData,
}: PickedIconProps) => {
  const style: CSSProperties = {
    backgroundColor: value.background,
    borderRadius: frames[value.frame ?? "rounded"],
    color: value.color ?? "currentColor",
    height: size,
    width: size,
  };
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(
        "inline-flex shrink-0 items-center justify-center align-middle",
        value.frame === "squircle" && "[corner-shape:squircle]",
        className
      )}
      style={style}
    >
      <span className="flex size-[60%] items-center justify-center">
        <IconGlyph name={value.name} data={iconData} />
      </span>
    </span>
  );
};
