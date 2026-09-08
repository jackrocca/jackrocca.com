import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CustomButton } from "@/ui/components/CustomButton";
import { site } from "@/lib/site";

export function ProjectFeature({
  headingLevel: Heading = "h3",
}: {
  headingLevel?: "h2" | "h3";
}) {
  return (
    <Link
      href="/pick4"
      className="group flex items-start justify-between gap-8 border-y py-7 transition-colors hover:bg-muted/40 sm:py-9"
    >
      <div>
        <div className="mb-3 flex items-center gap-3">
          <Heading className="text-lg font-medium tracking-tight">Pick 4</Heading>
          <span className="text-xs text-muted-foreground">2026</span>
        </div>
        <p className="max-w-md text-sm leading-7 text-muted-foreground">
          One league. Four picks each week. A season of friendly competition.
        </p>
      </div>
      <ArrowUpRight
        size={20}
        strokeWidth={1.5}
        className="mt-1 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      />
    </Link>
  );
}
export function Photography() {
  return (
    <Editorial title="Photography" intro="Selected photographs.">
      <div className="border-t py-10">
        <p className="text-sm text-muted-foreground">
          The first collection is coming soon.
        </p>
      </div>
    </Editorial>
  );
}
export function Writing() {
  return (
    <Editorial title="Writing" intro="Notes and stories, published on Substack.">
      <a
        href={site.substack}
        target="_blank"
        rel="noreferrer"
        className="group flex items-center justify-between gap-6 border-y py-8 transition-colors hover:bg-muted/40"
      >
        <div>
          <h2 className="text-lg font-medium">Jack Rocca on Substack</h2>
          <p className="mt-2 text-sm text-muted-foreground">@jackrocca</p>
        </div>
        <ArrowUpRight size={20} strokeWidth={1.5} />
      </a>
    </Editorial>
  );
}
export function Projects() {
  return (
    <Editorial title="Projects" intro="Things I’m building.">
      <ProjectFeature headingLevel="h2" />
      <CustomButton
        variant="link"
        href={site.github}
        external
        rightSide={<ArrowUpRight size={16} />}
        className="mt-7 px-0 text-sm text-muted-foreground"
      >
        More on GitHub
      </CustomButton>
    </Editorial>
  );
}
export function Editorial({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <main id="main-content" className="site-container min-h-[65vh] pb-24 pt-14 sm:pt-20">
      <h1 className="mb-4 text-3xl font-medium tracking-tight sm:text-4xl">{title}</h1>
      <p className="mb-12 max-w-lg text-base leading-7 text-muted-foreground">{intro}</p>
      {children}
    </main>
  );
}
