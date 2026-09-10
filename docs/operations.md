# Hosting and accounts

The active Vercel project is `fantasy-football-pickem`, project ID `prj_iqeRjrObwpBb8fjmoMGWv9rVrdRp`, in the personal team `jacks-projects-3515a39f` (`team_dhku4KaMep8WhcDXvF5FUQKc`). It is separate from AM Rocca. Verify `vercel whoami` and the ignored `.vercel/project.json` before deployment.

## Ownership and deployment audit — September 8, 2026

- GitHub identity: `jackrocca`. This website is the public repository `jackrocca/jackrocca.com`, renamed from `fantasy-football-pickem` with its history and pull requests preserved; Atlas is the private repository `jackrocca/photo-archivist`.
- Vercel identity: `jackrocca`, account `jrocca98@gmail.com`. The personal team above is on Pro. Use the isolated CLI configuration at `/Users/jack/Documents/Codex/2026-09-08/can-x20/work/vercel-jrocca` with `--scope jacks-projects-3515a39f`; the default CLI login may belong to AM Rocca.
- Pull request #3 is merged into `main` (merge commit `a286888`). The website rebuild and its history are now on the default branch.
- The existing Vercel project is connected to `jackrocca/jackrocca.com` (GitHub repository ID `1050047135`), with `main` as its production branch. GitHub sign-in is linked to the personal Vercel identity. Pushes to `main` trigger production deployments; use pull requests for future changes and verify both GitHub CI and Vercel deployment status.
- The Vercel project retains its existing name and canonical URL to preserve routing and Google callbacks. A repository rename does not require a new Vercel project, storage store, or domain cutover.
- Atlas now lives behind owner-only routes in this same Vercel project at `/atlas`; it does not require a separate Vercel project. Originals remain on the Mac. See the current release checkpoint below.

## Production operations

The current canonical origin is https://www.jackrocca.com. The apex `jackrocca.com` redirects to `www`; the original https://fantasy-football-pickem-sigma.vercel.app alias remains attached. Public home is `/`; the league is `/pick4`; shared account is `/account`. The registered Google callback remains `/api/auth/callback/google`. Safe return destinations are signed into the OAuth flow. Google audience is in production with basic identity/email/profile access only.

The personal Vercel team and both `jackrocca.com` and `www.jackrocca.com` assignments were verified live on September 8, 2026. Preserve the current Google authorized origins/callbacks and `APP_URL` when making presentation changes. Do not alter the older `jack-rocca` project while deploying this app.

Environment values are documented in `.env.example` and README.md. Keep secrets in local ignored environment files or Vercel; never commit OAuth client secrets, Blob tokens, sessions, credential backups, or test-login routes. Preview deployments use a separate storage namespace. `.vercelignore` excludes upstream/legacy sources and original artwork from uploads.

After deploying, verify `/api/health` on the canonical alias, feed freshness, public page responses, the owner session on `/account` and `/pick4`, and Google’s registered callback. `/dev/ui` must return 404. Production league writes must never be used as disposable test data.

Check the deployment's GitHub repository, commit SHA, production target, and alias;
`Ready` alone does not prove that the canonical site serves the expected commit.
Both local checkouts retain their existing filesystem locations; the website's
remote URL is `https://github.com/jackrocca/jackrocca.com.git`.

## Pick 4 link previews

`/pick4` has the title **Pick 4 Fantasy League**, a canonical URL on `www.jackrocca.com`,
and Open Graph / Twitter metadata. `app/pick4/opengraph-image.tsx` generates a
1200 × 630 PNG at build time using the preserved NFL shield in `public/nfl/league.png`.
It is public and requires no session. Verify the initial HTML and image response
with messaging-crawler user agents after deployment. Existing shared messages may
retain the preview cached by the messaging app.

## Private Atlas paid-capacity release — September 9, 2026

Production is `dpl_DvhorMFySLVFFP5HKDcLgaWKLGym`. The preceding deployment
`dpl_9Wwz6NfH4FTw7Gtp8NSdFptxZbT3` passed signed-out checks but returned 503 after
owner authentication because its CLI source upload omitted the Git-ignored
`private-atlas-build` directory. `.vercelignore` now explicitly includes that
generated directory. The corrected deployment source contains its complete bundle
and a manifest matching the local bytes; canonical alias inspection resolves to it.
All 16 signed-out canonical HTTP checks passed: health, private entry/API/bundle
restrictions with no-store headers, public home/gallery/Pick 4 and its OG image,
and `/dev/ui` denial. The complete website check and 69-file private bundle passed
before candidate deployment. Retain `dpl_2jRWBpJHjTZK9NKvN1CiWgeMFWr8` for rollback.

The private Cloudflare catalog now contains all 44,285 photo families and verified
previews at revision `c877ab57954c4d67bbb9d9ca76c5bad9`. Six live preview samples
matched the Mac's bytes. Jack confirmed owner login and Workers Paid; personal
Worker `4cf2c650-3e8d-47d2-b47d-89543929bea4` includes migrations 0005–0009.
The managed Mac API and worker are online. Private views include 163 people,
195 albums and 36,917 groups. A read-only production pipeline-status command
completed with HTTP 200 and its same-ID replay returned the saved result. See the private Atlas repository's `docs/private-release.md` for its
connection and operation acceptance. No public gallery publication or league data
write was performed during these checks. No source commit or push was made.

The dated September 8 checkpoints below are historical.

## Private Atlas release — September 8, 2026

The current source checkout is `/Users/jack/jack-os/apps/jackrocca.com`. The older
Documents/Codex checkout is stale. Preserve the current homepage, Google sign-in,
navigation, NFL and brand assets when integrating Atlas changes.

Private entry is `https://www.jackrocca.com/atlas`. The interface bundle lives in
ignored `private-atlas-build/`, outside `public/`, and every page, asset, API and
media request verifies the current Google owner identity. Website members and
league administrators do not gain access. Build the bundle from the private Atlas
repo with its `web/scripts/build-hosted.mjs`, passing this checkout explicitly.

Deployment `dpl_A8nJydJYruHXeuuJ8BkMnw4jQqEL` is the verified initial private release.
Its canonical health endpoint returns 200, signed-out `/atlas` returns 303 to
Google, and `/api/atlas/session` returns 401 with private/no-store headers.
Actual owner login, full private migration, persistent Mac pairing and full workflow
acceptance remain outstanding; this release alone is not completion of Atlas.

Production uses server-only `ATLAS_CONTROL_ORIGIN`, `ATLAS_CONTROL_ENVIRONMENT`
and `ATLAS_CONTROL_GATEWAY_TOKEN`. The separate worker credential stays in the
Mac's Keychain. Sensitive Vercel environment pulls show `[SENSITIVE]`, so compare
behavior rather than treating the masked text as a misconfigured actual value.

A prior candidate (`dpl_GirJzoxSwwLJdSHSCgXvM2Nzoxfh`) built but returned runtime
500s because a Next 16.3.4 framework dependency was absent from function traces.
It was rolled back to `dpl_DWzEVfMMsXTDBMRETPbbNvY6Mh6J`. The fixed Next config
includes `node_modules/next/dist/lib/framework/boundary-constants.js` in every route
trace. `npm run check:server-trace` verifies that dependency in actual build outputs
and runs as part of `npm run check`. Keep this gate until a verified framework
update makes the explicit inclusion unnecessary.

For future releases, deploy a production candidate with `--skip-domain`, verify
real HTTP health, private authorization and public pages through Vercel's existing
protection bypass, then promote. Never print bypass tokens or disable project
protection for testing. Preserve the prior known-good deployment for rollback.

The offline-startup follow-up was promoted as `dpl_93s3abykCkFpAPo4e6qRG5yFKG1y`.
It opens the hosted Pictures grid by default and allows URL initialization to finish
when Mac-only summary/sidebar reads are unavailable. Synthetic mobile browser QA
with the worker stopped shows a loaded cloud preview and no JavaScript errors.
The candidate passed real HTTP checks for health, private entry/API/bundle denial,
home, gallery, Pick 4 and its OG image before promotion. Full operation acceptance
and Mac pairing remain separate outstanding work.

The pending-action recovery release was promoted as
`dpl_GdSqkYsVPVQY8hDzzu495rDgBsDU`. The owner gateway adds bounded pending action
pages, exact saved-request inspection and explicit outcome review. Every route
retains owner pinning; reviews also require the canonical mutation Origin.
Cloudflare production Worker `7f4d9dd0-10b3-4950-bb47-07fdde41d0ea` stores owner
reviews separately from immutable worker receipts. An uncertain action is never
requeued or relabeled as successfully executed by recording a review.

Synthetic cross-service tests verify editing/People/album/tag/search workflows and
lost-response recovery. A fresh mobile browser discovered and reviewed the uncertain
action without any local pending IDs, with one original execution. The mobile
masthead now keeps Publish visible while primary tabs scroll. Real candidate and
canonical health/privacy/public-page checks pass; 14 route packages include the
required Next runtime trace file. The real library migration subsequently paused
at the D1 free-plan daily write limit; Google owner login and persistent Mac pairing
remain outstanding.

### Current compatible album/map release

Canonical production is `dpl_2jRWBpJHjTZK9NKvN1CiWgeMFWr8`, promoted after its unique
candidate passed health, private entry/API/bundle, public gallery, homepage, Pick 4
and OG-image checks. Canonical inspection resolves to this deployment; the same HTTP
checks pass there. The previous recovery release remains available for rollback.

This release fixes repeated failed map initialization, offers an album list when the
map cannot load, and clears the album loading state after photo data arrives. It also
includes the bounded album-page client and the new private workflow gateway reads.
Those reads activate only when `/v1/catalog/head` advertises `workflows-v1` and
`direct-albums-v1`; the current Cloudflare release advertises neither. The existing
Mac transport therefore remains compatible without a database migration or billing
change. Apply Atlas migration 0005 and verify its pending cloud release before
advertising those features. Cloudflare production remains
`c3a3ab68-2c79-41b9-a71f-e2c1f2f5eefb` with the three-photo pilot active.

Validation: 64 website unit tests and the full check passed, including the 14 route
trace checks. Atlas passed 498 Python tests (one optional skip), 16 subsequent
cross-service checks, 21 Cloudflare tests, and 200 UI tests plus builds/typechecks.
Synthetic desktop/mobile browser checks verified the album card, keyboard opening,
loaded photo, cleared spinner, no horizontal overflow and one map-configuration
request per mount with the Mac worker offline. Browser screenshot capture stalled
even on about:blank; geometry and loaded-image state were checked through the DOM.
The complete archive sync and offline-view activation are still pending Cloudflare
quota resolution. Actual owner login and production Mac pairing are not yet verified.
