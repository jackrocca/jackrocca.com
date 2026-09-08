import Link from "next/link";
export default function Privacy() {
  return (
    <main className="privacy-page panel">
      <Link className="text-button" href="/">
        ← Back to Pick 4
      </Link>
      <span className="eyebrow">JACK’S PICK 4 LEAGUE</span>
      <h1>Privacy</h1>
      <p>
        Pick 4 is Jack Rocca’s 2026 NFL league. Signing in with Google creates
        your account and adds you to this league.
      </p>
      <h2>Your account</h2>
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
        essential, HTTP-only session cookie keeps you signed in for up to 14
        days; a temporary cookie protects Google sign-in. Hosting services may
        process request metadata to operate the service. The app does not use
        advertising or analytics cookies.
      </p>
      <h2>Questions or deletion</h2>
      <p>
        Contact <a href="mailto:jrocca98@gmail.com">jrocca98@gmail.com</a> to
        request access to, correction of, or deletion of your account
        information.
      </p>
    </main>
  );
}
