import { CopyButton } from "@/components/ui-library/copy-button";
import { renderGuideText } from "@/lib/ui-catalog-text";

export const metadata = { title: "Using Rocca UI" };

const providersExample = `import { KitzeUIProvider } from "@/ui/components/KitzeUIContext";
import { AlertProvider } from "@/ui/components/AlertContext";
import { DialogManager } from "@/ui/components/DialogManager";
import { TooltipProvider } from "@/ui/primitives/tooltip";

<KitzeUIProvider isMobile={isMobile}>
  <TooltipProvider>
    <AlertProvider>
      <DialogManager>{children}</DialogManager>
    </AlertProvider>
  </TooltipProvider>
</KitzeUIProvider>`;

export default function UIGuidePage() {
  const guide = renderGuideText();

  return (
    <main id="main-content" className="pb-8">
      <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">Using Rocca UI</h1>
      <div className="ui-guide-prose mt-8">
        {guide
          .split(/\n\n+/)
          .map((block, index) =>
            block.startsWith("## ") ? (
              <h2 key={index}>{block.slice(3)}</h2>
            ) : (
              <p key={index}>{block}</p>
            ),
          )}
        <h2>Providers</h2>
        <p>
          Wrap the application once. The website does this in{" "}
          <code>components/providers.tsx</code>: KitzeUIProvider decides desktop vs
          mobile, then TooltipProvider, AlertProvider, and DialogManager nest inside it.
        </p>
        <pre>
          <code>{providersExample}</code>
        </pre>
        <h2>Simple vs Responsive</h2>
        <p>
          Simple components expose a smaller API for the standard presentation. Responsive
          components add a mobile presentation — usually a bottom drawer — to the same
          interaction. The dependency direction is Responsive → Simple. Use{" "}
          <code>mobileView=&quot;keep&quot;</code> when a centered dialog should stay
          centered on touch.
        </p>
        <h2>Import paths</h2>
        <ul>
          <li>
            <code>@/ui/components</code> — buttons, dialogs, selects, drawers, providers
          </li>
          <li>
            <code>@/ui/primitives</code> — styled Base UI primitives
          </li>
          <li>
            <code>@/ui/hooks</code> — UI-only hooks
          </li>
          <li>
            <code>@/ui/lib</code> — UI-only helpers and types
          </li>
        </ul>
        <h2>For coding agents</h2>
        <p>
          The machine-readable index is <a href="/ui/llms.txt">/ui/llms.txt</a>. It lists
          every component, its import, and its source file.
        </p>
        <CopyButton text={guide} label="Copy" className="min-h-10" />
      </div>
    </main>
  );
}
