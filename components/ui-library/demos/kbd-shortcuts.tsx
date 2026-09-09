"use client";

import { DemoNote, DemoRow, DemoSection } from "@/components/ui-library/demo";
import { KbdShortcuts } from "@/ui/components/KbdShortcuts";
import { MenuShortcut } from "@/ui/components/MenuShortcut";

export function KbdShortcutsDemo() {
  return (
    <>
      <DemoSection title="Shortcuts">
        <DemoRow>
          <KbdShortcuts shortcuts={["⌘", "K"]} />
          <KbdShortcuts shortcuts={["Shift", "Enter"]} />
        </DemoRow>
      </DemoSection>
      <DemoSection title="Separator">
        <DemoRow>
          <KbdShortcuts shortcuts={["⌘", "Shift", "P"]} separator="then" />
          <KbdShortcuts shortcuts={["Esc"]} separator={null} />
        </DemoRow>
      </DemoSection>
      <DemoSection title="Menu shortcut">
        <DemoRow className="w-full max-w-xs justify-between rounded-md border px-3 py-2">
          <span className="text-sm">Lock Week 3</span>
          <MenuShortcut shortcut={["⌘", "Enter"]} />
        </DemoRow>
        <DemoNote>
          MenuShortcut only styles KbdShortcuts. It does not read MenuContext, so this row
          is a standalone hint.
        </DemoNote>
      </DemoSection>
    </>
  );
}
