"use client";

import { DemoNote, DemoSection } from "@/components/ui-library/demo";
import { CustomButton } from "@/ui/components/CustomButton";
import { useKitzeUI } from "@/ui/components/KitzeUIContext";
import { ResponsiveDialog } from "@/ui/components/ResponsiveDialog";

export function UiContextDemo() {
  const { isMobile } = useKitzeUI();

  return (
    <>
      <DemoSection title="isMobile">
        <p className="font-mono text-sm">isMobile: {String(isMobile)}</p>
        <DemoNote>
          Switch the preview to Mobile to flip this value inside the frame.
        </DemoNote>
      </DemoSection>
      <DemoSection title="Responsive dialog">
        <ResponsiveDialog
          title={isMobile ? "Drawer" : "Dialog"}
          trigger={<CustomButton>Open {isMobile ? "drawer" : "dialog"}</CustomButton>}
        >
          The trigger label and title follow useKitzeUI().isMobile. On mobile this is a
          bottom drawer; on desktop it is a centered dialog.
        </ResponsiveDialog>
      </DemoSection>
    </>
  );
}
