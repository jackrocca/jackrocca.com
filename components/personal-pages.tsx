"use client";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Camera, Code2, PenLine } from "lucide-react";
import { CustomButton } from "@/components/CustomButton";
import { CustomBadge } from "@/components/CustomBadge";
const substack = "https://substack.com/@jackrocca";
export function ProjectFeature() {
  return (
    <Link
      href="/pick4"
      className="group grid overflow-hidden rounded-2xl border bg-card md:grid-cols-2"
    >
      <div className="relative flex min-h-[290px] flex-col justify-between bg-[#153d30] p-8 text-[#e7f5c5] sm:p-10">
        <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[.18em]">
          <span>The 2026 league</span>
          <span>01 / Project</span>
        </div>
        <div className="my-8 font-[family-name:var(--font-geist)] text-[clamp(72px,9vw,128px)] font-semibold leading-none tracking-[-.07em]">
          PICK 4<span className="text-[#8da96b]">.</span>
        </div>
        <div className="flex justify-between border-t border-white/20 pt-4 text-xs">
          <span>Favorite · Underdog · Over · Under</span>
          <ArrowUpRight
            size={18}
            className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
          />
        </div>
      </div>
      <div className="flex flex-col justify-center p-8 sm:p-12">
        <CustomBadge
          color="bg-emerald-700"
          variant="outline"
          className="mb-5 w-fit"
        >
          Live project
        </CustomBadge>
        <h3 className="mb-4 text-3xl font-medium tracking-tight">
          A season with something
          <br className="hidden sm:block" /> on every game.
        </h3>
        <p className="max-w-sm text-sm leading-7 text-muted-foreground">
          My NFL pick’em league. Four picks each week, a few season-long
          powerups, and a shared leaderboard.
        </p>
        <span className="mt-8 flex items-center gap-2 text-sm font-medium">
          Enter Pick 4 <ArrowRight size={16} />
        </span>
      </div>
    </Link>
  );
}
export function Home() {
  return (
    <main className="mx-auto max-w-7xl px-6 sm:px-10">
      <section className="grid gap-8 pb-20 pt-16 sm:pb-24 sm:pt-24 lg:grid-cols-[1.35fr_1fr] lg:items-end">
        <div>
          <p className="mb-6 text-[11px] font-medium uppercase tracking-[.23em] text-muted-foreground">
            The personal website of Jack Rocca
          </p>
          <h1 className="font-['DM_Serif_Display'] text-[clamp(54px,7vw,98px)] leading-[1.02] tracking-[-.035em]">
            Looking closer.
            <br />
            <em className="font-normal text-[#718065]">Making things.</em>
          </h1>
        </div>
        <div className="max-w-sm lg:mb-2 lg:ml-auto">
          <p className="text-base leading-8 text-muted-foreground">
            A home for my photography, writing, and projects. A few things I’m
            making, noticing, and spending time with.
          </p>
          <CustomButton
            href="/projects"
            variant="outline"
            rightIcon={ArrowRight}
            className="mt-7 h-11"
          >
            Explore projects
          </CustomButton>
        </div>
      </section>
      <section className="border-t py-10 sm:py-14">
        <div className="mb-7 flex items-baseline justify-between">
          <h2 className="text-xs uppercase tracking-[.2em] text-muted-foreground">
            Featured project
          </h2>
          <Link href="/projects" className="flex items-center gap-1 text-xs">
            All projects <ArrowUpRight size={14} />
          </Link>
        </div>
        <ProjectFeature />
      </section>
      <section className="grid border-t pb-16 md:grid-cols-2">
        <div className="py-10 md:border-r md:pr-12">
          <Camera
            size={23}
            strokeWidth={1.4}
            className="mb-7 text-muted-foreground"
          />
          <h2 className="mb-3 font-['DM_Serif_Display'] text-4xl">
            Photography
          </h2>
          <p className="max-w-sm text-sm leading-7 text-muted-foreground">
            A space for selected photographs. The first collection is still
            taking shape.
          </p>
          <CustomButton
            href="/photography"
            variant="link"
            rightIcon={ArrowRight}
            className="mt-5 px-0"
          >
            Visit the photography page
          </CustomButton>
        </div>
        <div className="border-t py-10 md:border-0 md:pl-12">
          <PenLine
            size={23}
            strokeWidth={1.4}
            className="mb-7 text-muted-foreground"
          />
          <h2 className="mb-3 font-['DM_Serif_Display'] text-4xl">Writing</h2>
          <p className="max-w-sm text-sm leading-7 text-muted-foreground">
            Find my writing on Substack, and follow along there for new posts.
          </p>
          <CustomButton
            href={substack}
            variant="link"
            rightIcon={ArrowUpRight}
            className="mt-5 px-0"
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
    <Editorial
      title="Photography"
      intro="A place for selected photographs, with room to look a little longer."
    >
      <section className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center">
        <Camera
          size={30}
          strokeWidth={1.3}
          className="mb-5 text-muted-foreground"
        />
        <h2 className="font-['DM_Serif_Display'] text-3xl">
          The first collection is taking shape.
        </h2>
        <p className="mt-3 max-w-sm text-sm leading-7 text-muted-foreground">
          I’ll share selected photographs here soon.
        </p>
      </section>
    </Editorial>
  );
}
export function Writing() {
  return (
    <Editorial
      title="Writing"
      intro="Notes, ideas, and stories. Published on Substack."
    >
      <a
        href={substack}
        target="_blank"
        rel="noreferrer"
        className="group flex min-h-56 items-center justify-between gap-5 rounded-xl border bg-card p-8 sm:p-12"
      >
        <div>
          <p className="mb-4 text-xs uppercase tracking-[.2em] text-muted-foreground">
            Substack
          </p>
          <h2 className="font-['DM_Serif_Display'] text-4xl">Jack Rocca</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            @jackrocca · Read and follow along
          </p>
        </div>
        <ArrowUpRight
          size={30}
          strokeWidth={1.3}
          className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
        />
      </a>
    </Editorial>
  );
}
export function Projects() {
  return (
    <Editorial
      title="Projects"
      intro="Things I’m building, experimenting with, and putting out into the world."
    >
      <ProjectFeature />
      <div className="mt-10 flex items-center gap-3 text-sm text-muted-foreground">
        <Code2 size={18} />
        <CustomButton
          variant="link"
          href="https://github.com/jackrocca"
          rightIcon={ArrowUpRight}
        >
          More on GitHub
        </CustomButton>
      </div>
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
    <main className="mx-auto min-h-[70vh] max-w-7xl px-6 pb-20 pt-16 sm:px-10 sm:pt-20">
      <h1 className="mb-6 font-['DM_Serif_Display'] text-6xl tracking-tight sm:text-7xl">
        {title}
      </h1>
      <p className="mb-14 max-w-xl text-base leading-8 text-muted-foreground">
        {intro}
      </p>
      {children}
    </main>
  );
}
