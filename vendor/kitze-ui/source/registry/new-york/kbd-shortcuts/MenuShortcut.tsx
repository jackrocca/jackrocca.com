import { cn } from "@/lib/utils";
import { KbdShortcuts } from "@/registry/new-york/kbd-shortcuts/KbdShortcuts";

export const menuShortcutKeys = (shortcut: string | string[]) => {
  if (Array.isArray(shortcut)) {
    return shortcut;
  }
  return (
    shortcut.includes("+")
      ? shortcut.split("+")
      : (shortcut.match(/[⌘⌥⇧⌃↵⌫⎋]|[^⌘⌥⇧⌃↵⌫⎋]+/gu) ?? [])
  )
    .map((key) => key.trim())
    .filter(Boolean);
};

export const MenuShortcut = ({
  shortcut,
  destructive,
  className,
}: {
  shortcut: string | string[];
  destructive?: boolean | undefined;
  className?: string | undefined;
}) => (
  <KbdShortcuts
    shortcuts={menuShortcutKeys(shortcut)}
    separator={null}
    classNames={{
      key: "h-6 min-w-6 justify-center border-current/20 bg-transparent px-1.5 text-sm text-current",
      root: cn(
        "ml-auto shrink-0 gap-1",
        destructive ? "text-current" : "text-muted-foreground",
        className
      ),
    }}
  />
);
