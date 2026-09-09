"use client";

import { useState } from "react";

import { DemoNote, DemoSection, DemoStack } from "@/components/ui-library/demo";
import { SearchBar } from "@/ui/components/SearchBar";

const projects = ["Coastal edit", "Night walk", "Pick 4 branding", "Season recap"];

export function SearchBarDemo() {
  const [query, setQuery] = useState("");
  const [closed, setClosed] = useState("Ready");
  const matches = projects.filter((project) =>
    project.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <>
      <DemoSection title="Controlled">
        <DemoStack>
          <label>Find a project</label>
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Coastal edit, night walk…"
          />
        </DemoStack>
        <DemoNote>
          {query
            ? matches.length
              ? matches.join(", ")
              : "No projects match"
            : "Showing every project until you type."}
        </DemoNote>
      </DemoSection>
      <DemoSection title="Escape">
        <DemoStack>
          <SearchBar
            value={query}
            onChange={setQuery}
            onForceClose={() => {
              setQuery("");
              setClosed("Cleared with Escape");
            }}
            placeholder="Press Escape to clear"
          />
        </DemoStack>
        <DemoNote>{closed}. The clear button also empties the field.</DemoNote>
      </DemoSection>
    </>
  );
}
