"use client";

import { useId, useState } from "react";
import { Search } from "lucide-react";

import { DemoSection, DemoStack } from "@/components/ui-library/demo";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/ui/primitives/input-group";

export function InputGroupDemo() {
  const urlId = useId();
  const searchId = useId();
  const captionId = useId();
  const [caption, setCaption] = useState("");

  return (
    <>
      <DemoSection title="Prefix">
        <DemoStack>
          <div className="grid gap-2">
            <label htmlFor={urlId}>Project URL</label>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>jackrocca.com/</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput id={urlId} placeholder="photography" />
            </InputGroup>
          </div>
        </DemoStack>
      </DemoSection>
      <DemoSection title="Suffix">
        <DemoStack>
          <div className="grid gap-2">
            <label htmlFor={searchId}>Find a frame</label>
            <InputGroup>
              <InputGroupInput id={searchId} placeholder="Coastal edit" />
              <InputGroupAddon align="inline-end">
                <InputGroupButton aria-label="Search frames">
                  <Search />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </DemoStack>
      </DemoSection>
      <DemoSection title="Textarea">
        <DemoStack>
          <div className="grid gap-2">
            <label htmlFor={captionId}>Caption</label>
            <InputGroup>
              <InputGroupTextarea
                id={captionId}
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                placeholder="Write a caption…"
              />
              <InputGroupAddon align="block-end">
                <InputGroupButton>Save caption</InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </DemoStack>
      </DemoSection>
    </>
  );
}
