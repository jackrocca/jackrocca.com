"use client";

import { useId, useState } from "react";

import { DemoSection, DemoStack } from "@/components/ui-library/demo";
import { Textarea } from "@/ui/primitives/textarea";

export function TextareaDemo() {
  const captionId = useId();
  const notesId = useId();
  const [caption, setCaption] = useState("Week 3 sideline, late light.");

  return (
    <>
      <DemoSection title="Basic">
        <DemoStack>
          <div className="grid gap-2">
            <label htmlFor={captionId}>Caption</label>
            <Textarea
              id={captionId}
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="Write a caption for this frame…"
            />
          </div>
        </DemoStack>
      </DemoSection>
      <DemoSection title="Disabled">
        <DemoStack>
          <div className="grid gap-2">
            <label htmlFor={notesId}>Commissioner notes</label>
            <Textarea
              id={notesId}
              disabled
              defaultValue="Season pot stays at $40. No mid-season buy-ins."
            />
          </div>
        </DemoStack>
      </DemoSection>
    </>
  );
}
