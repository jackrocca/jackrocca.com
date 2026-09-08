"use client";
import { cn } from "@/lib/utils";
import type { IconAppearanceProps } from "@/registry/new-york/icon-picker/IconAppearance";
import { iconColorPresets } from "@/registry/new-york/picked-icon/icon-types";

export const IconColorFields = ({
  value,
  onChange,
  colorMode,
  presets = iconColorPresets,
}: IconAppearanceProps) => (
  <div className="flex flex-col gap-2">
    {(["foreground", "background"] as const)
      .filter((mode) => colorMode === "both" || colorMode === mode)
      .map((mode) => {
        const field = mode === "foreground" ? "color" : "background";
        const label = mode === "foreground" ? "Icon color" : "Background";
        return (
          <fieldset key={mode} className="flex min-w-0 flex-wrap gap-1">
            <legend className="mb-1 text-xs font-medium">{label}</legend>
            <button
              type="button"
              aria-label={`Reset ${label.toLowerCase()}`}
              title="Reset"
              className="size-6 cursor-pointer rounded-full border text-xs"
              onClick={() => {
                const next = { ...value };
                if (field === "color") {
                  delete next.color;
                } else {
                  delete next.background;
                }
                onChange(next);
              }}
            >
              ×
            </button>
            {presets.map((preset) => (
              <button
                type="button"
                key={preset.label}
                title={preset.label}
                aria-label={`${label}: ${preset.label}`}
                aria-pressed={value[field] === preset[field]}
                className={cn(
                  "size-6 cursor-pointer rounded-full border border-black/10 outline-offset-2 focus-visible:outline-2",
                  value[field] === preset[field] &&
                    "ring-foreground ring-offset-background ring-2 ring-offset-2"
                )}
                style={{ backgroundColor: preset[field] }}
                onClick={() => onChange({ ...value, [field]: preset[field] })}
              />
            ))}
            <label className="flex items-center gap-1 text-xs">
              <span className="sr-only">Custom</span>
              <input
                aria-label={`Custom ${label.toLowerCase()}`}
                title={`Custom ${label.toLowerCase()}`}
                type="color"
                className="size-6 cursor-pointer border-0 bg-transparent p-0"
                value={
                  value[field]?.match(/^#[0-9a-f]{6}$/iu)?.[0] ?? "#475569"
                }
                onChange={(event) =>
                  onChange({ ...value, [field]: event.target.value })
                }
              />
            </label>
          </fieldset>
        );
      })}
  </div>
);
