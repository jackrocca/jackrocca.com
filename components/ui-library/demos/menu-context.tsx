"use client";

import { useState } from "react";

import { DemoNote, DemoSection } from "@/components/ui-library/demo";
import { BottomDrawerMenu } from "@/ui/components/BottomDrawerMenu";
import { BottomDrawerMenuItem } from "@/ui/components/BottomDrawerMenuItem";
import { CustomButton } from "@/ui/components/CustomButton";
import { MenuProvider, useMenuContext } from "@/ui/components/MenuContext";

function LeagueMenuList() {
  const { closeMenu, menuType, open } = useMenuContext();

  return (
    <div>
      <p className="text-muted-foreground px-4 pb-2 font-mono text-xs">
        menuType: {menuType} · open: {String(open)}
      </p>
      <BottomDrawerMenuItem onClick={() => closeMenu?.()}>
        Week 3 picks
      </BottomDrawerMenuItem>
      <BottomDrawerMenuItem onClick={() => closeMenu?.()}>
        Season pot
      </BottomDrawerMenuItem>
      <BottomDrawerMenuItem destructive onClick={() => closeMenu?.()}>
        Leave league
      </BottomDrawerMenuItem>
    </div>
  );
}

export function MenuContextDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <DemoSection title="Custom list">
        <BottomDrawerMenu
          title="League"
          open={open}
          onOpenChange={setOpen}
          content={
            <MenuProvider
              menuType="bottom-drawer"
              open={open}
              closeMenu={() => setOpen(false)}
            >
              <LeagueMenuList />
            </MenuProvider>
          }
        >
          <CustomButton>Open league menu</CustomButton>
        </BottomDrawerMenu>
        <DemoNote>
          BottomDrawerMenu already provides MenuProvider. This list wraps its own provider
          so items can close through useMenuContext().
        </DemoNote>
      </DemoSection>
    </>
  );
}
