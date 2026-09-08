"use client";

import Picker, { EmojiStyle, Theme } from "emoji-picker-react";

const metrics = {
  "--epr-header-padding": "12px",
  "--epr-horizontal-padding": "12px",
  "--epr-search-input-height": "36px",
  border: 0,
  borderRadius: 0,
};
const appColors = {
  "--epr-bg-color": "var(--picker-surface, var(--color-popover))",
  "--epr-category-icon-active-color": "var(--color-foreground)",
  "--epr-category-label-bg-color":
    "var(--picker-surface, var(--color-popover))",
  "--epr-category-label-text-color": "var(--color-muted-foreground)",
  "--epr-focus-bg-color": "var(--color-muted)",
  "--epr-highlight-color": "var(--color-ring)",
  "--epr-hover-bg-color": "var(--color-muted)",
  "--epr-search-border-color": "transparent",
  "--epr-search-input-bg-color":
    "color-mix(in srgb, var(--color-muted) 60%, transparent)",
  "--epr-search-input-bg-color-active":
    "color-mix(in srgb, var(--color-muted) 60%, transparent)",
  "--epr-text-color": "var(--color-muted-foreground)",
};
const themes = { auto: Theme.AUTO, dark: Theme.DARK, light: Theme.LIGHT };
const EmojiLibrary = ({
  theme,
  onSelect,
}: {
  theme: "auto" | "light" | "dark";
  onSelect: (emoji: string) => void;
}) => (
  <Picker
    width="100%"
    height={440}
    style={theme === "auto" ? { ...metrics, ...appColors } : metrics}
    theme={themes[theme]}
    emojiStyle={EmojiStyle.NATIVE}
    lazyLoadEmojis
    previewConfig={{ showPreview: false }}
    onEmojiClick={(emoji) => onSelect(emoji.emoji)}
  />
);
export default EmojiLibrary;
