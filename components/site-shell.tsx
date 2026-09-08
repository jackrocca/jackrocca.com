"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, UserRound } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { CustomButton } from "@/components/CustomButton";
const links = [
  { label: "Photography", href: "/photography" },
  { label: "Writing", href: "/writing" },
  { label: "Projects", href: "/projects" },
];
export function SiteHeader() {
  const pathname = usePathname();
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
      className={
        mobile ? "flex flex-col gap-2 p-4" : "hidden items-center gap-7 md:flex"
      }
    >
      {links.map((link) => (
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
        height={76}
        classNames={{
          root: "mx-auto max-w-[1440px] px-3 sm:px-8",
          container: "mx-auto max-w-none",
          leftSide: "flex-1",
          rightSide: "flex-none gap-5",
        }}
        leftSide={
          <Link
            href="/"
            aria-label="Jack Rocca home"
            className="text-lg font-semibold tracking-tight"
          >
            Jack Rocca<span className="text-primary">.</span>
          </Link>
        }
        renderRightSide={({ bottomDrawer }) => (
          <>
            {nav()}
            <CustomButton
              href="/account"
              variant="ghost"
              icon={UserRound}
              aria-label={name ? `${name}'s account` : "Sign in"}
              tooltip={name ? "Your account" : "Sign in"}
              className="size-10 p-0"
            />
            <div className="md:hidden">{bottomDrawer(nav(true))}</div>
          </>
        )}
      />
    </header>
  );
}
export function SiteFooter() {
  return (
    <footer className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t px-6 py-8 text-xs text-muted-foreground sm:px-10">
      <span>© {new Date().getFullYear()} Jack Rocca</span>
      <div className="flex items-center gap-6">
        <Link href="/privacy" className="py-2">
          Privacy
        </Link>
        <a
          href="https://substack.com/@jackrocca"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 py-2"
        >
          Substack <ArrowUpRight size={12} />
        </a>
        <a
          href="https://github.com/jackrocca"
          target="_blank"
          rel="noreferrer"
          className="py-2"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
