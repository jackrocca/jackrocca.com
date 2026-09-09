"use client";

import { DemoRow, DemoSection } from "@/components/ui-library/demo";
import { Kbd } from "@/ui/components/Kbd";

export function KbdDemo() {
  return (
    <>
      <DemoSection title="Sequences">
        <DemoRow>
          <Kbd keys={["⌘", "K"]} />
          <Kbd keys={["Shift", "Enter"]} />
          <Kbd keys={["Esc"]} />
        </DemoRow>
      </DemoSection>
      <DemoSection title="In copy">
        <p className="text-sm">
          Open the command palette with <Kbd keys={["⌘", "K"]} /> or confirm a pick with{" "}
          <Kbd keys={["Shift", "Enter"]} />.
        </p>
      </DemoSection>
    </>
  );
}
