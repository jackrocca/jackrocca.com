"use client";

import { useState } from "react";

import { DemoNote, DemoSection } from "@/components/ui-library/demo";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/ui/primitives/alert-dialog";
import { Button } from "@/ui/primitives/button";

export function AlertDialogDemo() {
  const [status, setStatus] = useState("Week 3 pick is still in");

  return (
    <>
      <DemoSection title="Composition">
        <AlertDialog>
          <AlertDialogTrigger
            render={<Button variant="destructive">Remove pick</Button>}
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove the Week 3 pick?</AlertDialogTitle>
              <AlertDialogDescription>
                This cannot be undone. The slot goes back to empty until you choose
                another team.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep pick</AlertDialogCancel>
              <AlertDialogAction onClick={() => setStatus("Week 3 pick removed")}>
                Remove pick
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <DemoNote>{status}</DemoNote>
      </DemoSection>
    </>
  );
}
