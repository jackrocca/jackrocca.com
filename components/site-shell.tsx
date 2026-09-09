"use client";
import Link from "next/link";
import Image from "next/image";
import logoArtwork from "@/assets/brand/jack-rocca-logo-teal.original.png";
import { site } from "@/lib/site";
import { usePathname } from "next/navigation";
import { LayoutGrid, UserRound, ChevronRight } from "lucide-react";
import { PageHeader } from "@/ui/components/PageHeader";
import { useDrawer } from "@/ui/components/DrawerContext";
export function SiteHeader() {
  const pathname = usePathname();
  const isPick4 = pathname === "/pick4" || pathname.startsWith("/pick4/");
  const logo = (
    <Link href="/" aria-label="Jack Rocca home" className="site-signature">
      <Image
        src={logoArtwork}
        alt="Jack Rocca"
        sizes="(min-width: 640px) 208px, (min-width: 375px) 156px, 112px"
        preload
        className="h-full w-full object-cover"
      />
    </Link>
  );
  return (
    <header className="border-b border-border/70 bg-background">
      <div className="site-header-frame" data-project={isPick4 ? "pick4" : undefined}>
        {logo}
        <div className="site-project-mark" aria-hidden={!isPick4}>
          <Image src="/nfl/league.png" alt="NFL" width={64} height={64} loading="eager" />
        </div>
        <PageHeader
          key={pathname}
          height={88}
          classNames={{
            root: "px-0",
            container: "site-header-bar mx-auto max-w-none px-0",
            leftSide: "flex-1",
            rightSide: "flex-1 items-center gap-0 sm:gap-3",
            menuButton: "size-10 p-0",
          }}
          renderRightSide={({ bottomDrawer }) =>
            bottomDrawer(<SiteNavigation pathname={pathname} />)
          }
        />
      </div>
    </header>
  );
}
function SiteNavigation({ pathname }: { pathname: string }) {
  const { close } = useDrawer();
  const links = [
    ...site.navigation.map((link) => ({ ...link, icon: LayoutGrid })),
    { label: "Account", href: "/account", icon: UserRound },
  ];
  return (
    <nav aria-label="Site navigation" className="site-menu">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={close}
          aria-current={pathname === href ? "page" : undefined}
          className="site-menu-link"
        >
          <Icon size={20} strokeWidth={1.5} />
          <span>{label}</span>
          <ChevronRight size={16} strokeWidth={1.5} />
        </Link>
      ))}
    </nav>
  );
}

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/photography") return null;
  return (
    <footer
      style={
        pathname === "/pick4"
          ? { paddingBottom: "calc(112px + env(safe-area-inset-bottom))" }
          : undefined
      }
      className="site-container flex flex-wrap items-center justify-between gap-4 border-t py-8 text-xs text-muted-foreground"
    >
      <span>© {new Date().getFullYear()} Jack Rocca</span>
      <div className="flex items-center gap-6">
        <Link href="/privacy" className="flex min-h-10 items-center">
          Privacy
        </Link>
        <a
          href={site.github}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-10 items-center"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
