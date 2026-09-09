"use client";

import { DemoNote, DemoSection } from "@/components/ui-library/demo";
import { Button } from "@/ui/primitives/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/primitives/dialog";

export function DialogDemo() {
  return (
    <>
      <DemoSection title="Composition">
        <Dialog>
          <DialogTrigger render={<Button>Open Week 3</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Lock Week 3?</DialogTitle>
              <DialogDescription>
                Four picks lock at the first Sunday kickoff. This uses the primitive tree,
                not SimpleDialog.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Keep editing
              </DialogClose>
              <DialogClose render={<Button />}>Lock picks</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <DemoNote>Close from either footer action or the X control.</DemoNote>
      </DemoSection>
    </>
  );
}
