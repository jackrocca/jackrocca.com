"use client";

import { useState } from "react";

import { DemoNote, DemoRow, DemoSection, DemoStack } from "@/components/ui-library/demo";
import { SocialLoginButton } from "@/ui/components/SocialLoginButton";
import type { SocialLoginProvider } from "@/ui/components/SocialLoginButton";

export function SocialLoginButtonDemo() {
  const [clicked, setClicked] = useState<string>("None");

  const handleClick = (provider: SocialLoginProvider) => {
    setClicked(provider);
  };

  return (
    <>
      <DemoSection title="Outline">
        <DemoStack>
          <SocialLoginButton provider="google" onClick={() => handleClick("google")} />
          <SocialLoginButton provider="github" onClick={() => handleClick("github")} />
          <SocialLoginButton provider="apple" onClick={() => handleClick("apple")} />
        </DemoStack>
      </DemoSection>
      <DemoSection title="Brand">
        <DemoStack>
          <SocialLoginButton
            provider="google"
            variant="brand"
            onClick={() => handleClick("google")}
          />
          <SocialLoginButton
            provider="github"
            variant="brand"
            onClick={() => handleClick("github")}
          />
          <SocialLoginButton
            provider="apple"
            variant="brand"
            onClick={() => handleClick("apple")}
          />
        </DemoStack>
      </DemoSection>
      <DemoSection title="Icon only">
        <DemoRow>
          <SocialLoginButton
            provider="google"
            iconOnly
            onClick={() => handleClick("google")}
          />
          <SocialLoginButton
            provider="github"
            iconOnly
            onClick={() => handleClick("github")}
          />
          <SocialLoginButton
            provider="apple"
            iconOnly
            onClick={() => handleClick("apple")}
          />
        </DemoRow>
        <DemoNote>Clicked: {clicked}</DemoNote>
      </DemoSection>
    </>
  );
}
