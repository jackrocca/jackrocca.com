"use client";

import { DemoNote, DemoSection } from "@/components/ui-library/demo";
import { Button } from "@/ui/primitives/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/ui/primitives/tooltip";

export function TooltipDemo() {
  return (
    <>
      <DemoSection title="Composition">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger render={<Button variant="outline">Week 3 lock</Button>} />
            <TooltipContent>Picks lock at Sunday kickoff</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DemoNote>
          The site already wraps the app in TooltipProvider. This tree shows the
          primitive.
        </DemoNote>
      </DemoSection>
      <DemoSection title="Placement">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger render={<Button variant="ghost">Season pot</Button>} />
            <TooltipContent side="bottom">$40 · pays out after Week 18</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DemoSection>
    </>
  );
}
