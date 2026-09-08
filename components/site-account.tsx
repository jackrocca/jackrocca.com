"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LogOut, ShieldCheck } from "lucide-react";
import { Input } from "@/ui/components/Input";
import { CustomButton } from "@/ui/components/CustomButton";
import { SocialLoginButton } from "@/ui/components/SocialLoginButton";
import { CustomBadge } from "@/ui/components/CustomBadge";
import { Spinner } from "@/ui/components/Spinner";
import { Editorial } from "@/components/personal-pages";
type Account = {
  user: { id: string; name: string; email: string; role: string } | null;
  authentication: { ready: boolean };
};
export function SiteAccount() {
  const [data, setData] = useState<Account | null>(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  const router = useRouter();
  async function load() {
    const r = await fetch("/api/account", { cache: "no-store" });
    if (!r.ok) throw new Error("Account unavailable. Please try again.");
    setData(await r.json());
  }
  useEffect(() => {
    void load().catch((e) => setError(e.message));
    const params = new URLSearchParams(location.search);
    if (params.has("authError")) {
      setError("Google sign-in was not completed. Please try again.");
      history.replaceState(null, "", "/account");
    }
  }, []);
  async function action(route: string, payload: unknown) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const r = await fetch("/api/" + route, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await r.json();
      if (!r.ok) throw new Error(result.error);
      await load();
      window.dispatchEvent(new Event("account-changed"));
      router.refresh();
      if (route === "profile") setNotice("Your display name is saved.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Editorial
      title="Your account"
      intro="One Google account for this website and Jack’s Pick 4 league."
    >
      <div className="max-w-xl border-t pt-8">
        {error && (
          <p role="alert" className="mb-5 text-sm text-destructive">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="mb-5 text-sm text-primary">
            {notice}
          </p>
        )}
        {!data && error ? (
          <CustomButton
            onClick={() => {
              setError("");
              void load().catch((e) => setError(e.message));
            }}
          >
            Try again
          </CustomButton>
        ) : !data ? (
          <div className="flex items-center gap-3 text-sm">
            <Spinner />
            Loading your account
          </div>
        ) : data.user ? (
          <div className="space-y-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{data.user.name}</h2>
                <p className="mt-2 break-all text-sm text-muted-foreground">
                  {data.user.email}
                </p>
              </div>
              <CustomBadge color="bg-zinc-700" variant="outline" className="shrink-0">
                Google
              </CustomBadge>
            </div>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void action("profile", {
                  name: new FormData(e.currentTarget).get("name"),
                });
              }}
            >
              <label htmlFor="display-name" className="text-sm font-medium">
                Display name
              </label>
              <Input
                id="display-name"
                name="name"
                defaultValue={data.user.name}
                minLength={2}
                maxLength={40}
                required
                autoComplete="nickname"
                className="h-11"
              />
              <CustomButton type="submit" loading={busy}>
                Save display name
              </CustomButton>
            </form>
            <div className="border-t pt-6">
              <p className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck size={17} />
                {data.user.role === "admin"
                  ? "You’re the league commissioner."
                  : "You’re a member of Jack’s league."}
              </p>
              <CustomButton href="/pick4" variant="outline" rightIcon={ArrowRight}>
                Open Pick 4
              </CustomButton>
            </div>
            <CustomButton
              variant="ghost"
              leftIcon={LogOut}
              disabled={busy}
              onClick={() => void action("logout", {})}
            >
              Sign out
            </CustomButton>
          </div>
        ) : (
          <>
            <h2 className="mb-3 text-2xl font-medium">Welcome in.</h2>
            <p className="mb-7 text-sm leading-7 text-muted-foreground">
              Sign in with Google to create your account. You’ll automatically join Jack’s
              Pick 4 league.
            </p>
            <SocialLoginButton
              provider="google"
              size="lg"
              className="w-full"
              disabled={!data.authentication.ready}
              onClick={() => {
                location.href = "/api/auth/google?returnTo=/account";
              }}
            />
            <p className="mt-5 text-xs leading-6 text-muted-foreground">
              By signing in, your name and email are used for your account.{" "}
              <a href="/privacy" className="underline">
                Privacy details
              </a>
            </p>
          </>
        )}
      </div>
    </Editorial>
  );
}
