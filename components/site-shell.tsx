"use client";
import Link from "next/link";
import Image from "next/image";
import { site } from "@/lib/site";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, UserRound } from "lucide-react";
import { PageHeader } from "@/ui/components/PageHeader";
import { CustomButton } from "@/ui/components/CustomButton";
export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [name, setName] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    const refresh = () =>
      fetch("/api/account", { cache: "no-store" })
        .then((r) => r.json())
        .then((data) => {
          if (active) setName(data.user?.name ?? null);
        })
        .catch(() => {});
    void refresh();
    window.addEventListener("account-changed", refresh);
    return () => {
      active = false;
      window.removeEventListener("account-changed", refresh);
    };
  }, [pathname]);
  const nav = (mobile = false) => (
    <nav
      aria-label={mobile ? "Mobile site navigation" : "Site navigation"}
      className={mobile ? "flex flex-col gap-2 p-4" : "hidden items-center gap-7 md:flex"}
    >
      {site.navigation.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={pathname === link.href ? "page" : undefined}
          className={`py-3 text-sm transition-colors hover:text-foreground ${pathname === link.href ? "text-foreground" : "text-muted-foreground"}`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
  return (
    <header className="border-b border-border/70 bg-background">
      <PageHeader
        key={pathname}
        height={100}
        classNames={{
          root: isHome
            ? "mx-auto max-w-[1440px] px-0 sm:px-4"
            : "mx-auto max-w-[1024px] px-2 sm:px-6",
          container: "mx-auto max-w-none",
          leftSide: "flex-1",
          rightSide: "flex-none gap-5",
        }}
        leftSide={
          <Link
            href="/"
            aria-label="Jack Rocca home"
            className="flex min-h-11 w-[132px] items-center sm:w-[150px]"
          >
            <Image
              src="/jack-rocca-logo.svg"
              alt="Jack Rocca"
              width={202}
              height={87}
              priority
              className="h-auto w-full"
            />
          </Link>
        }
        renderRightSide={({ bottomDrawer }) => (
          <>
            {!isHome && nav()}
            <CustomButton
              href="/account"
              variant="ghost"
              icon={UserRound}
              aria-label={name ? `${name}'s account` : "Sign in"}
              tooltip={isHome ? undefined : name ? "Your account" : "Sign in"}
              className="size-10 p-0"
            />
            <div className={isHome ? "" : "md:hidden"}>{bottomDrawer(nav(true))}</div>
          </>
        )}
      />
    </header>
  );
}
export function SiteFooter() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return (
    <footer className="mx-auto flex w-full max-w-[1024px] flex-wrap items-center justify-between gap-4 border-t px-6 py-8 text-xs text-muted-foreground sm:px-10">
      <span>© {new Date().getFullYear()} Jack Rocca</span>
      <div className="flex items-center gap-6">
        <Link href="/privacy" className="flex min-h-10 items-center">
          Privacy
        </Link>
        <a
          href={site.substack}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 py-2 min-h-10"
        >
          Substack <ArrowUpRight size={12} />
        </a>
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
