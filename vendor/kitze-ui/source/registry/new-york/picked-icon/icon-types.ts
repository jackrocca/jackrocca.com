export type IconFrame = "circle" | "square" | "rounded" | "squircle";
export interface IconValue {
  name: string;
  color?: string;
  background?: string;
  frame?: IconFrame;
}
export type IconColorMode =
  | "none"
  | "foreground"
  | "background"
  | "both"
  | "paired";
export interface IconColorPreset {
  label: string;
  color: string;
  background: string;
}
export const iconColorPresets: IconColorPreset[] = [
  { background: "#e2e8f0", color: "#475569", label: "Slate" },
  { background: "#fee2e2", color: "#dc2626", label: "Red" },
  { background: "#ffedd5", color: "#ea580c", label: "Orange" },
  { background: "#fef3c7", color: "#b45309", label: "Amber" },
  { background: "#dcfce7", color: "#15803d", label: "Green" },
  { background: "#ccfbf1", color: "#0f766e", label: "Teal" },
  { background: "#dbeafe", color: "#2563eb", label: "Blue" },
  { background: "#ede9fe", color: "#7c3aed", label: "Violet" },
  { background: "#fce7f3", color: "#db2777", label: "Pink" },
  { background: "#f1f5f9", color: "#334155", label: "Steel" },
  { background: "#f5f5f4", color: "#57534e", label: "Stone" },
  { background: "#ffe4e6", color: "#be123c", label: "Rose" },
  { background: "#fae8ff", color: "#a21caf", label: "Fuchsia" },
  { background: "#f3e8ff", color: "#9333ea", label: "Purple" },
  { background: "#e0e7ff", color: "#4338ca", label: "Indigo" },
  { background: "#e0f2fe", color: "#0369a1", label: "Sky" },
  { background: "#cffafe", color: "#0e7490", label: "Cyan" },
  { background: "#d1fae5", color: "#047857", label: "Emerald" },
  { background: "#ecfccb", color: "#4d7c0f", label: "Lime" },
  { background: "#fef9c3", color: "#854d0e", label: "Yellow" },
];
