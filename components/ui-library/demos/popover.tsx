"use client";

import { DemoSection } from "@/components/ui-library/demo";
import { Button } from "@/ui/primitives/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/primitives/popover";

export function PopoverDemo() {
  return (
    <>
      <DemoSection title="Anchored">
        <Popover>
          <PopoverTrigger render={<Button variant="outline">Season pot</Button>} />
          <PopoverContent>
            <p className="font-medium">Season pot</p>
            <p className="text-muted-foreground mt-1 text-sm">
              $40 across eight players. Pays out after Week 18.
            </p>
          </PopoverContent>
        </Popover>
      </DemoSection>
      <DemoSection title="Placement">
        <Popover>
          <PopoverTrigger render={<Button variant="ghost">Week 3 lock</Button>} />
          <PopoverContent side="top">
            <p className="text-sm">Picks lock at the first Sunday kickoff.</p>
          </PopoverContent>
        </Popover>
      </DemoSection>
    </>
  );
}
