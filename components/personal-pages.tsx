import Image from "next/image";
import Link from "next/link";
import { Blocks } from "lucide-react";

const projectCardClass =
  "group flex items-center gap-5 rounded-2xl bg-card p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.06)] transition-[background-color,box-shadow] duration-200 hover:bg-muted/40 hover:shadow-[0_4px_20px_rgba(0,0,0,0.07),0_0_0_1px_rgba(0,0,0,0.08)]";

export function Projects() {
  return (
    <main id="main-content" className="site-container min-h-[65vh] pb-24 pt-14 sm:pt-20">
      <h1 className="sr-only">Projects</h1>
      <div className="grid max-w-3xl gap-6 sm:grid-cols-2">
        <Link href="/pick4" className={projectCardClass}>
          <Image
            src="/nfl/league.png"
            alt="NFL"
            width={52}
            height={64}
            className="h-16 w-13 shrink-0 object-contain"
          />
          <div>
            <h2 className="text-lg font-medium tracking-tight">Pick 4</h2>
            <p className="mt-1 text-sm text-muted-foreground">Four picks. Every week.</p>
          </div>
        </Link>
        <Link href="/ui" className={projectCardClass}>
          <div
            aria-hidden
            className="flex h-16 w-13 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--brand-teal)_8%,white)]"
          >
            <Blocks className="size-6 text-[var(--brand-teal)]" />
          </div>
          <div>
            <h2 className="text-lg font-medium tracking-tight">Rocca UI</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Components I actually use.
            </p>
          </div>
        </Link>
      </div>
    </main>
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
