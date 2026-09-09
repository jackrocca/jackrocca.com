"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LogOut, ShieldCheck } from "lucide-react";
import { Input } from "@/ui/components/Input";
import { CustomButton } from "@/ui/components/CustomButton";
import { SignInPage } from "@/components/sign-in-page";
import { CustomBadge } from "@/ui/components/CustomBadge";
import { Editorial } from "@/components/personal-pages";
import { ProfilePhotoField } from "@/components/player-avatar";
type Account = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarRevision: number;
  } | null;
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
  if (!data?.user) {
    return (
      <SignInPage
        returnTo="/account"
        ready={data?.authentication.ready ?? false}
        loading={!data && !error}
        error={error}
        onRetry={
          !data && error
            ? () => {
                setError("");
                void load().catch((e) => setError(e.message));
              }
            : undefined
        }
      />
    );
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
          <ProfilePhotoField
            name={data.user.name}
            userId={data.user.id}
            revision={data.user.avatarRevision ?? 0}
            disabled={busy}
            onRevision={() => void load()}
            onNotice={setNotice}
            onError={setError}
          />
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
      </div>
    </Editorial>
  );
}
