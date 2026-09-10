import Image from "next/image";
import Link from "next/link";

export function Projects() {
  return (
    <main id="main-content" className="site-container min-h-[65vh] pb-24 pt-14 sm:pt-20">
      <h1 className="sr-only">Projects</h1>
      <Link
        href="/pick4"
        className="group flex max-w-sm items-center gap-5 rounded-2xl bg-card p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.06)] transition-colors duration-200 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-muted/40"
      >
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
