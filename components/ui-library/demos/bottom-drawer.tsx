"use client";

import { useState } from "react";
import { LogOut, Trophy, Wallet } from "lucide-react";

import { DemoNote, DemoRow, DemoSection } from "@/components/ui-library/demo";
import { BottomDrawer } from "@/ui/components/BottomDrawer";
import { BottomDrawerMenu } from "@/ui/components/BottomDrawerMenu";
import { CustomButton } from "@/ui/components/CustomButton";

export function BottomDrawerDemo() {
  const [choice, setChoice] = useState("None");
  const [open, setOpen] = useState(false);

  return (
    <>
      <DemoSection title="Content">
        <BottomDrawer
          title="Season pot"
          trigger={<CustomButton variant="outline">Open pot</CustomButton>}
        >
          Eight players chipped in $5. The pot sits at $40 until Week 18.
        </BottomDrawer>
      </DemoSection>
      <DemoSection title="Menu">
        <BottomDrawerMenu
          title="League"
          items={[
            {
              label: "Week 3 picks",
              leftIcon: Trophy,
              onClick: () => setChoice("Week 3 picks"),
            },
            {
              label: "Season pot",
              leftIcon: Wallet,
              onClick: () => setChoice("Season pot"),
            },
            {
              label: "Leave league",
              leftIcon: LogOut,
              destructive: true,
              onClick: () => setChoice("Left league"),
            },
          ]}
        >
          <CustomButton>League menu</CustomButton>
        </BottomDrawerMenu>
        <DemoNote>Last choice: {choice}</DemoNote>
      </DemoSection>
      <DemoSection title="Controlled">
        <DemoRow>
          <CustomButton variant="outline" onClick={() => setOpen(true)}>
            Open sheet
          </CustomButton>
          <BottomDrawer title="Photography" open={open} onOpenChange={setOpen}>
            New frames land here before they move into a named project.
          </BottomDrawer>
        </DemoRow>
      </DemoSection>
    </>
  );
}
