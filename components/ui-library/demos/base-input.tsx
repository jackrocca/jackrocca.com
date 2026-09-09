"use client";

import { useId, useState } from "react";

import { DemoSection, DemoStack } from "@/components/ui-library/demo";
import { Input } from "@/ui/primitives/input";

export function BaseInputDemo() {
  const nameId = useId();
  const emailId = useId();
  const disabledId = useId();
  const [name, setName] = useState("Jack Rocca");

  return (
    <>
      <DemoSection title="Basic">
        <DemoStack>
          <div className="grid gap-2">
            <label htmlFor={nameId}>Display name</label>
            <Input
              id={nameId}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
            />
          </div>
        </DemoStack>
      </DemoSection>
      <DemoSection title="Types">
        <DemoStack>
          <div className="grid gap-2">
            <label htmlFor={emailId}>Invite email</label>
            <Input id={emailId} type="email" placeholder="player@league.test" />
          </div>
        </DemoStack>
      </DemoSection>
      <DemoSection title="Disabled">
        <DemoStack>
          <div className="grid gap-2">
            <label htmlFor={disabledId}>Season pot</label>
            <Input id={disabledId} disabled defaultValue="$40 locked" />
          </div>
        </DemoStack>
      </DemoSection>
    </>
  );
}
