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
export function Home() {
  return (
    <main id="main-content" className="site-container">
      <section className="pb-20 pt-16 sm:pb-28 sm:pt-24">
        <h1 className="mb-6 text-3xl font-medium tracking-tight sm:text-4xl">
          Jack Rocca
        </h1>
        <p className="max-w-lg text-lg leading-8 text-muted-foreground">
          Photographs, occasional writing, and things I’m building.
        </p>
      </section>
      <section aria-labelledby="projects-heading" className="pb-16">
        <div className="mb-5 flex items-center justify-between">
          <h2 id="projects-heading" className="text-sm font-medium">
            Projects
          </h2>
          <Link
            href="/projects"
            className="flex min-h-10 items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            View all <ArrowUpRight size={14} />
          </Link>
        </div>
        <ProjectFeature />
      </section>
      <section className="grid gap-12 pb-24 sm:grid-cols-2 sm:gap-16">
        <div>
          <h2 className="mb-3 text-sm font-medium">Photography</h2>
          <p className="mb-4 text-sm leading-7 text-muted-foreground">
            A collection of selected photographs, coming soon.
          </p>
          <CustomButton
            href="/photography"
            variant="link"
            rightSide={<ArrowUpRight size={16} />}
            className="h-10 px-0 text-sm"
          >
            Photography
          </CustomButton>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-medium">Writing</h2>
          <p className="mb-4 text-sm leading-7 text-muted-foreground">
            Notes and stories, published on Substack.
          </p>
          <CustomButton
            href={site.substack}
            external
            variant="link"
            rightSide={<ArrowUpRight size={16} />}
            className="h-10 px-0 text-sm"
          >
            Read on Substack
          </CustomButton>
        </div>
      </section>
    </main>
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
