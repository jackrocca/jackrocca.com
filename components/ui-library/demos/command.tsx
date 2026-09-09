"use client";

import { useState } from "react";

import { DemoNote, DemoSection } from "@/components/ui-library/demo";
import { Button } from "@/ui/primitives/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/ui/primitives/command";

export function CommandDemo() {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState("None");

  return (
    <>
      <DemoSection title="Palette">
        <div className="w-full max-w-sm rounded-xl border">
          <Command>
            <CommandInput placeholder="Search pages…" />
            <CommandList>
              <CommandEmpty>No matching pages</CommandEmpty>
              <CommandGroup heading="Pages">
                <CommandItem
                  value="photography"
                  onSelect={() => setPicked("Photography")}
                >
                  Photography
                  <CommandShortcut>⌘P</CommandShortcut>
                </CommandItem>
                <CommandItem value="projects" onSelect={() => setPicked("Projects")}>
                  Projects
                  <CommandShortcut>⌘R</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="League">
                <CommandItem value="week-3" onSelect={() => setPicked("Week 3")}>
                  Week 3<CommandShortcut>⌘3</CommandShortcut>
                </CommandItem>
                <CommandItem value="season-pot" onSelect={() => setPicked("Season pot")}>
                  Season pot
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
        <DemoNote>Selected: {picked}</DemoNote>
      </DemoSection>
      <DemoSection title="Dialog">
        <Button onClick={() => setOpen(true)}>Open palette</Button>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <Command>
            <CommandInput placeholder="Jump to a section…" />
            <CommandList>
              <CommandEmpty>Nothing found</CommandEmpty>
              <CommandGroup heading="Go to">
                <CommandItem value="photography" onSelect={() => setOpen(false)}>
                  Photography
                </CommandItem>
                <CommandItem value="pick4" onSelect={() => setOpen(false)}>
                  Pick 4
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>
      </DemoSection>
    </>
  );
}
