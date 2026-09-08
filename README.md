# Pick 4 — 2026 NFL league

Jack Rocca’s single NFL pick’em league with Google sign-in, rebuilt for Vercel using Next.js, React, TypeScript, and private Vercel Blob storage. The original Streamlit application and historical CSV files remain in the repository for reference; the new app starts a fresh 2026 league and does not import those accounts or results.

## Run locally

```sh
npm ci
cp .env.example .env.local
# Fill SESSION_SECRET and CRON_SECRET with independent random values.
# Configure the Google settings described below.
npm run dev -- --port 3106
```

Without a Blob token, development stores data in `work/league.local.json`. Production refuses to start its API without private cloud storage. Never use local filesystem persistence on Vercel.

Open `http://localhost:3106`. Every successful Google sign-in creates or resumes one account in this league. There is no league creation, invitation, username, or app-password flow. Only the verified Google email configured as `OWNER_EMAIL` receives commissioner access; the first person to sign in is not automatically the commissioner. Players can update their league display name in **Your account**. Sessions use HTTP-only cookies and expire after 14 days.

## Google sign-in configuration

1. In Google Cloud, create a project (or use the intended personal-site project) and configure Google Auth Platform branding and an **External** audience. Request only `openid`, `email`, and `profile`; no Gmail or Drive access.
2. Create an OAuth **Web application** client. Register the exact production redirect URI: `https://fantasy-football-pickem-sigma.vercel.app/api/auth/callback/google`. For local work, also register `http://localhost:3106/api/auth/callback/google`.
3. Set server-only `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OWNER_EMAIL=jrocca98@gmail.com`, and `APP_URL=https://fantasy-football-pickem-sigma.vercel.app` in Vercel production. Local `APP_URL` is `http://localhost:3106`.
4. Use the app homepage and `/privacy` for branding links. Publish the OAuth audience for general Google-account access; **Testing** restricts sign-in to explicitly listed test users. Complete any verification Google requires for the chosen branding/domain.
5. Redeploy after environment changes and test a real Google login as the owner and as a player. Successful login automatically enrolls the person. Legacy setup, invite, password, and recovery endpoints return 410.

The OAuth authorization-code flow uses PKCE, a signed short-lived state cookie, and a nonce. The official Google library verifies the ID token signature, issuer, audience, and expiry; the app also requires a verified email and matching nonce. Accounts bind to Google’s stable `sub`, never a supplied email or name. Google tokens are not persisted. This app remains standalone; shared sessions with the future personal website are not implemented yet.

## Vercel deployment

1. Link this directory to a **Next.js** project in the intended Vercel account. Use a separate `--global-config` directory when switching accounts.
2. Create and connect a **private** Blob store in `sfo1` to production and preview. Vercel supplies `BLOB_READ_WRITE_TOKEN`.
3. Add `SESSION_SECRET` and `CRON_SECRET` as secret environment variables, plus the Google configuration above. Use independently generated random strings with at least 32 characters. Never commit these values.
4. Deploy with `vercel --prod`. The cron schedule runs every five minutes and requires a Vercel plan that supports that frequency. For Hobby, an external scheduler can call `/api/cron` with `Authorization: Bearer CRON_SECRET`; do not silently reduce the schedule and assume live operations remain equivalent.
5. Sign in with the owner Google account, check commissioner access, then share the homepage link. Check `/api/health`: `authentication` should be `google` and `configured` should be `true`. Remove the retired `SETUP_TOKEN` environment variable.
6. Wednesday 09:00 **America/Los_Angeles**, the first successful sync freezes the DraftKings lines and opens picks (normally within five minutes). A commissioner can publish earlier. Lines cannot be changed after publication. If the feed is unavailable, publication retries before kickoff; after kickoff the app refuses to create a late snapshot from potentially in-play lines.
7. Verify the canonical production URL, login, persistent saves, and scheduled sync. A successful deployment status alone is not a readiness check.

The production Blob namespace is `pick4/2026/state.json`; preview uses `pick4/preview/state.json`; local cloud development uses `pick4/development/state.json`. Never configure `LEAGUE_STORAGE_PREFIX` in production. Tests may supply a unique prefix. Preview and production data are isolated even if they share a store. Google sign-in always redirects to `APP_URL`, preventing arbitrary preview hosts from becoming OAuth callback URLs. Leave Google credentials absent on previews unless configuring a separate test client and registered preview callback; do not confuse a canonical production sign-in with a preview session.

The app works with direct CLI deployments. Automatic Git deployments additionally require the Vercel GitHub installation to have access to this repository; a CLI deployment does not imply that connection is configured.

## Season and scoring

- 272 verified 2026 regular-season games, 18 weeks, 32 teams with 17 games each. `data/schedule-2026.json` is a real schedule fallback, never a mock score feed.
- Live schedules, DraftKings spreads/totals, status and scores come from ESPN's public NFL scoreboard feed. No API key is needed. This is a third-party feed without a guaranteed SLA; missing markets are unavailable, never fabricated. Each card shows feed freshness and the frozen-line timestamp.
- Pick one favorite, one underdog, one over, and one under, from **four different games**. The server constructs selections from its frozen snapshot and ignores client line values.
- Normal win = 1; push = 0.5; loss = 0; four wins = 5 total. Canceled games are void for 0.5 and cannot complete a perfect week. Live, missing, or postponed results remain pending.
- **Super Spread:** once per season, favorite must be −5 or greater; use double its spread, scoring 2.5 for a win, 1 for a push, 0 for a loss. The ordinary perfect-week bonus does not apply.
- **Total Helper:** once per season, lower the chosen over line by 5 or raise the chosen under line by 5. Only the selected total changes. Normal scoring and perfect-week bonus remain available.
- **Perfect Prediction:** once per season, all four wins = 8 total. Otherwise normal scoring. Powerups can be combined; if Super Spread is active, its doubled line must be beaten to count as a win. An 8-point perfect card replaces other bonuses.
- Deadline = first non-canceled scheduled kickoff in that week, **not a hardcoded Thursday**. Week 1 is Wednesday September 9, 2026 at 17:20 Pacific / September 10 at 00:20 UTC.
- Existing entries lock at that deadline. A new late entry may select only four unstarted games, gets a one-point penalty (floor zero), cannot use any powerup, and locks immediately.
- Scores derive from saved picks and current results; reads never add points into mutable totals. Repeated refreshes and score corrections do not double-count standings.
- Tiebreakers: season points, perfect weeks, winning picks. Matching records share a rank.

The old Python scoring implementation contradicted the help text for Super Spread and applied Total Helper to both totals. The rebuild follows the explicit powerup descriptions and documents the resolved behavior above.

## Commissioner operations and recovery

The commissioner can copy the league link, view member emails, publish weekly lines early, refresh the feed, correct final scores/void canceled games after kickoff, and export league data. Google manages account recovery. Corrections are audited and preserved across subsequent feed updates. **Export league data** downloads members (without Google identifiers or emails), picks, snapshots, results, and the audit trail.

If the feed fails, previously fetched data stays visible with its timestamp. Existing frozen lines and saved picks stay intact. Keep a periodic export and back up the private Blob state through the hosting account. The Blob state includes Google account identifiers and emails: treat full state backups as private personal data.

All writes use uncached reads plus Blob `ifMatch` ETag conditional writes with bounded retries. Reads request identity encoding to preserve strong origin ETags; compressed responses can yield weak ETags unsuitable for compare-and-swap. This gives atomic account enrollment, unique accounts, season-powerup enforcement, and concurrent pick saves for this small private league. Stale tab revisions return a conflict instead of replacing a newer card. This is designed for a small league, not a high-traffic public multi-league service.

## Verify

```sh
npm test
npm run typecheck
npm run build
npm audit --omit=dev
```

`npm run sync:schedule` refreshes the checked-in real 2026 schedule and requires 272 unique games before replacing it. Runtime cron updates current, previous, and next weeks, plus older weeks with unresolved games; the in-app refresh also updates the selected week. Commissioner corrections survive feed refreshes.

For an isolated API integration run, use `npx tsx scripts/check-api.ts`. It calls the real route handlers with temporary local storage, seeds test identities through internal code, verifies concurrent picks and access boundaries, and deletes its fixtures afterward. It refuses production and never contacts Google. This is separate from the required real Google sign-in smoke test. Unit tests cover OAuth state integrity/expiry, account enrollment, provider identity, role assignment, session invalidation, data privacy, and scoring.

## Source references

- [NFL 2026 schedule](https://www.nfl.com/schedules/2026/by-week/reg-1)
- [NFL Wednesday September 9 kickoff announcement](https://www.nfl.com/_amp/seahawks-to-kick-off-2026-nfl-regular-season-on-wednesday-sept-9-in-seattle)
- [ESPN Week 1 scoreboard feed](https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=2026&seasontype=2&week=1&limit=1000)
- [Vercel Blob conditional writes and private storage](https://vercel.com/docs/vercel-blob/using-blob-sdk)

- [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect)
- [Google web-server OAuth flow](https://developers.google.com/identity/protocols/oauth2/web-server)
