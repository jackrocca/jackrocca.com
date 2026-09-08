"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { IconColorFields } from "@/registry/new-york/icon-picker/IconColorFields";
import type {
  IconColorMode,
  IconColorPreset,
  IconFrame,
  IconValue,
} from "@/registry/new-york/picked-icon/icon-types";
import { iconColorPresets } from "@/registry/new-york/picked-icon/icon-types";

export interface IconAppearanceProps {
  value: IconValue;
  onChange: (value: IconValue) => void;
  colorMode?: IconColorMode | undefined;
  presets?: IconColorPreset[] | undefined;
  allowFrame?: boolean | undefined;
}
const frames: IconFrame[] = ["circle", "square", "rounded", "squircle"];
const radii = { circle: "50%", rounded: "22%", square: "0", squircle: "50%" };
export const IconAppearance = ({
  value,
  onChange,
  colorMode = "paired",
  presets = iconColorPresets,
  allowFrame = true,
}: IconAppearanceProps) => {
  const [custom, setCustom] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      {colorMode === "paired" && (
        <fieldset>
          <legend className="sr-only">Color presets</legend>
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium">Colors</span>
            <button
              type="button"
              onClick={() => setCustom(!custom)}
              aria-pressed={custom}
              className="text-muted-foreground hover:text-foreground cursor-pointer rounded px-1 focus-visible:outline-2"
            >
              {custom ? "Presets" : "Custom / separate"}
            </button>
          </div>
          {!custom && (
            <div className="grid grid-cols-10 gap-1.5">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  title={preset.label}
                  aria-label={`Color preset: ${preset.label}`}
                  aria-pressed={
                    value.color === preset.color &&
                    value.background === preset.background
                  }
                  className={cn(
                    "flex aspect-square cursor-pointer items-center justify-center rounded-full outline-offset-2 focus-visible:outline-2",
                    value.color === preset.color &&
                      value.background === preset.background &&
                      "ring-foreground ring-offset-background ring-1 ring-offset-2"
                  )}
                  style={{ backgroundColor: preset.background }}
                  onClick={() =>
                    onChange({
                      ...value,
                      background: preset.background,
                      color: preset.color,
                    })
                  }
                >
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: preset.color }}
                  />
                </button>
              ))}
            </div>
          )}
        </fieldset>
      )}
      {(colorMode !== "paired" || custom) && (
        <IconColorFields
          value={value}
          onChange={onChange}
          colorMode={colorMode === "paired" ? "both" : colorMode}
          presets={presets}
        />
      )}
      {allowFrame && (
        <fieldset className="flex items-center gap-1">
          <legend className="sr-only">Shape</legend>
          <span className="mr-auto text-xs font-medium" aria-hidden="true">
            Shape
          </span>
          {frames.map((frame) => (
            <button
              key={frame}
              type="button"
              aria-label={frame}
              title={frame}
              aria-pressed={(value.frame ?? "rounded") === frame}
              className={cn(
                "hover:bg-muted flex size-8 cursor-pointer items-center justify-center rounded-md focus-visible:outline-2",
                (value.frame ?? "rounded") === frame &&
                  "bg-muted ring-border ring-1 ring-inset"
              )}
              onClick={() => onChange({ ...value, frame })}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "size-4 border-[1.5px] border-current",
                  frame === "squircle" && "[corner-shape:squircle]"
                )}
                style={{ borderRadius: radii[frame] }}
              />
            </button>
          ))}
        </fieldset>
      )}
    </div>
  );
};
