import Link from "next/link";
export const metadata = { title: "Privacy" };
export default function Privacy() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 [&_h2]:mb-3 [&_h2]:mt-9 [&_h2]:text-xl [&_h2]:font-medium [&_p]:text-sm [&_p]:leading-7 [&_p]:text-muted-foreground">
      <Link href="/" className="text-sm">
        ← Jack Rocca
      </Link>
      <h1 className="mb-7 mt-10 font-['DM_Serif_Display'] text-6xl">Privacy</h1>
      <p>
        This is Jack Rocca’s personal website, including the 2026 Pick 4 NFL
        league. Public photography, writing, and project pages can be browsed
        without an account. Signing in with Google creates an account for this
        website and automatically adds you to the league.
      </p>
      <h2>Your Google account</h2>
      <p>
        We receive your verified email address, Google account identifier, and
        name. These identify your account and let you sign in again. You can
        change the display name other players see. We do not request access to
        Gmail messages, contacts, or Google Drive, and do not store your Google
        password or Google access tokens.
      </p>
      <h2>League information</h2>
      <p>
        Your display name, standings, and results are visible to signed-in
        league members. Picks are hidden from other players until the weekly
        deadline. Your email address is visible to you and the commissioner. The
        commissioner can export league records and review an activity log.
      </p>
      <h2>Storage and cookies</h2>
      <p>
        Account and league records are stored in private Vercel Blob storage. An
        essential HTTP-only session cookie keeps you signed in for up to 14
        days; a temporary cookie protects Google sign-in. Hosting services may
        process request metadata to operate the service. The app does not use
        advertising or analytics cookies.
      </p>
      <h2>External sites</h2>
      <p>
        Links to Substack, GitHub, and other sites take you to services with
        their own privacy practices. Following the Substack link does not
        subscribe you or share your website account with Substack.
      </p>
      <h2>Questions or deletion</h2>
      <p>
        Contact{" "}
        <a className="underline" href="mailto:jrocca98@gmail.com">
          jrocca98@gmail.com
        </a>{" "}
        to request access to, correction of, or deletion of your account
        information.
      </p>
    </main>
  );
}
