import { CopyButton } from "@/components/ui-library/copy-button";
import { renderGuideText } from "@/lib/ui-catalog-text";
import { uiLibrary } from "@/lib/ui-catalog";

export const metadata = { title: "Usage guide" };

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

const h2 = "text-xl font-semibold";
const pre = "overflow-x-auto rounded-lg bg-muted p-4 font-mono text-xs leading-relaxed";

export default function UIGuidePage() {
  const guide = renderGuideText();
  const sections = guide.split(/\n(?=## )/);

  return (
    <article
      id="main-content"
      className="mx-auto max-w-3xl space-y-6 px-6 py-10 text-sm leading-relaxed"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Using {uiLibrary.name}</h1>
        <CopyButton text={guide} label="Copy for agents" />
      </div>
      {sections.map((section) => {
        const [heading, ...blocks] = section.split(/\n\n+/);
        return (
          <section key={heading} className="space-y-4">
            <h2 className={h2}>{heading?.replace(/^## /, "")}</h2>
            {blocks.map((block, index) => (
              <p key={index}>{block}</p>
            ))}
          </section>
        );
      })}
      <section className="space-y-4">
        <h2 className={h2}>Providers</h2>
        <p>
          Wrap the application once. The website does this in{" "}
          <code className="font-mono text-xs">components/providers.tsx</code>:
          KitzeUIProvider decides desktop vs mobile, then TooltipProvider, AlertProvider
          and DialogManager nest inside it.
        </p>
        <pre className={pre}>{providersExample}</pre>
      </section>
      <section className="space-y-4">
        <h2 className={h2}>Import paths</h2>
        <pre
          className={pre}
        >{`@/ui/components   buttons, dialogs, selects, drawers, providers
@/ui/primitives   styled Base UI primitives
@/ui/hooks        UI-only hooks
@/ui/lib          UI-only helpers and types`}</pre>
      </section>
      <section className="space-y-4">
        <h2 className={h2}>For coding agents</h2>
        <p>
          The machine-readable index is{" "}
          <a href="/ui/llms.txt" className="underline underline-offset-4">
            /ui/llms.txt
          </a>
          . It lists every component, its import, its props and its source file. Copy for
          agents on a component page includes the same data for one component.
        </p>
      </section>
    </article>
  );
}
