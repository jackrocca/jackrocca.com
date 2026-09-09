"use client";

import Image from "next/image";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { SocialLoginButton } from "@/ui/components/SocialLoginButton";
import { CustomButton } from "@/ui/components/CustomButton";

export function SignInPage({
  returnTo,
  ready,
  loading = false,
  error,
  onRetry,
}: {
  returnTo: "/account" | "/pick4";
  ready: boolean;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}) {
  const league = returnTo === "/pick4";
  return (
    <main id="main-content" className="sign-in-screen">
      <section className="sign-in-card" aria-labelledby="sign-in-title">
        <div className="sign-in-mark" aria-hidden="true">
          {league ? (
            <Image src="/nfl/league.png" alt="" width={48} height={48} />
          ) : (
            <UserRound size={30} strokeWidth={1.35} />
          )}
        </div>
        <h1 id="sign-in-title">{league ? "Four picks. Every week." : "Welcome in."}</h1>
        <p className="sign-in-copy">
          {league
            ? "A favorite, an underdog, an over, and an under. Make your picks and join the league."
            : "Sign in to your account and join Jack’s Pick\u00a04 league."}
        </p>
        {error && (
          <p className="sign-in-error" role="alert">
            {error}
          </p>
        )}
        {onRetry ? (
          <CustomButton onClick={onRetry} className="w-full">
            Try again
          </CustomButton>
        ) : (
          <SocialLoginButton
            provider="google"
            size="lg"
            className="w-full"
            loading={loading}
            disabled={!ready}
            label={loading ? "Getting ready…" : "Continue with Google"}
            onClick={() => {
              location.href = `/api/auth/google?returnTo=${returnTo}`;
            }}
          />
        )}
        {!loading && !ready && !onRetry && (
          <p className="sign-in-unavailable" role="status">
            Google sign-in is being connected. Please check back shortly.
          </p>
        )}
        <p className="sign-in-note">One account. No password to remember.</p>
        <div className="sign-in-bottom">
          <span>Your name and email are used for your account.</span>
          <Link href="/privacy">Privacy</Link>
        </div>
      </section>
    </main>
  );
}
