"use client";

import { useId, useState } from "react";
import { Camera, Search } from "lucide-react";

import { DemoSection, DemoStack } from "@/components/ui-library/demo";
import { CustomButton } from "@/ui/components/CustomButton";
import { Input } from "@/ui/components/Input";

export function InputDemo() {
  const searchId = useId();
  const projectId = useId();
  const captionId = useId();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <>
      <DemoSection title="Basic">
        <DemoStack>
          <div className="grid gap-2">
            <label htmlFor={searchId}>Find a frame</label>
            <Input
              id={searchId}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Coastal edit, night walk…"
            />
          </div>
        </DemoStack>
      </DemoSection>
      <DemoSection title="With icons">
        <DemoStack>
          <div className="grid gap-2">
            <label htmlFor={projectId}>Project name</label>
            <Input
              id={projectId}
              leftIcon={Search}
              rightIcon={Camera}
              placeholder="Photography / Projects"
            />
          </div>
        </DemoStack>
      </DemoSection>
      <DemoSection title="Loading">
        <DemoStack>
          <div className="grid gap-2">
            <label htmlFor={captionId}>Caption</label>
            <Input
              id={captionId}
              isLoading={loading}
              placeholder="Saving caption…"
              defaultValue="Week 3 sideline"
            />
          </div>
          <CustomButton variant="outline" onClick={() => setLoading((value) => !value)}>
            Toggle loading
          </CustomButton>
        </DemoStack>
      </DemoSection>
    </>
  );
}
