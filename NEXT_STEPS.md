# Personal website: next steps

Updated September 8, 2026. This is the handoff for the agent working in
`jackrocca/jackrocca.com`. The companion agent works in the private
`jackrocca/photo-archivist` repository. Start with `AGENTS.md`,
`docs/architecture.md`, `docs/operations.md`, and `docs/photography.md`.

## Agreed direction

Jack wants the cloud platform to stay within **Vercel and Cloudflare**. Use Vercel
for the existing Next.js website and a future separate owner-only Atlas interface;
use **Cloudflare R2** for photo storage. Backblaze and a separately operated
Postgres provider are not the selected direction. Keep the Mac for RAW previews,
face processing, and LM Studio initially. A cloud catalog must be evaluated within
Cloudflare before selecting its final schema and migration strategy.

The website is a minimal photography portfolio with a centered supplied logo,
newest-first masonry photos, Writing linking to `https://substack.com/@jackrocca`,
Projects, and the working single-league Pick 4 app at `/pick4`. Do not replace this
with a generic landing page or add explanatory marketing copy.

## Current working baseline

- Shared Google website accounts; public 3–5-star photos, members 1–5 stars.
- People and Places are member features. Public photo responses omit people,
  place, date, embedded metadata, and source filesystem information.
- SQLite in Atlas is authoritative; the website reads a published snapshot.
- Latest snapshot: 762 ranked families / 43 public photos / about 57 MiB of WebP
  previews. No originals are hosted by this website yet.
- `lib/photography.ts` contains the schema, visibility, and chronological ordering;
  `lib/photo-store.ts` reads private Blob; `scripts/sync-photos.ts` publishes;
  `scripts/photography/read_catalog.py` projects Atlas read-only.
- Private Blob also stores league state. **Do not migrate or overwrite league
  state while changing photo storage.**
- The owned component library is `ui/`; `vendor/kitze-ui/` is the preserved upstream.

## First milestone: an R2 publication interface Atlas can use

Own the website side of the [publication contract](docs/photo-publication-contract.md).
Coordinate its interface with the Atlas agent before implementing incompatible
changes. Atlas owns selection/export, the local outbox, and the Publish UI; this
repository owns validation, cloud publication, gallery storage, and read access.

1. Add an R2 adapter behind the existing photo-store boundary. Retain the Blob
   adapter for rollback. Start with isolated development/preview fixtures.
2. Build the authenticated begin/upload/commit/status interface described in the
   contract. The Atlas agent can develop against a mock until this is ready.
   Do not send the full Vercel environment or broad R2 keys to Atlas browser code.
3. Keep private storage, content-addressed previews, bounded uploads, stable photo
   IDs, compare-and-swap catalog revisions, and no-store authorized image routes.
   Unrated, trashed, withdrawn, or down-rated photos must stop being served from
   their old URLs once a new publication commits.
4. Copy only currently published previews into a dedicated private R2 gallery
   bucket. Verify byte hashes and public/member behavior before switching reads.
   Leave Blob available for rollback until the new path is verified.
5. Prove an Atlas rating change can be published and seen on the website. Use
   synthetic fixtures or an explicitly selected test photo; do not alter unrelated
   real ratings as disposable test data.

**Acceptance:** 3–5-star photos work anonymously; 1–2 require a valid session;
metadata stays redacted; ordering and pagination remain stable; partial upload
does not change the live snapshot; duplicate commit is idempotent; stale publisher
gets a conflict; revoked credentials fail; preview cannot write production.

**Performance gate:** R2 is selected for archive economics and ecosystem fit, not
a proven latency win. Benchmark identical previews through the actual protected
delivery paths on Blob and R2: cold/warm p50/p95 time-to-first-byte, first useful
gallery paint, and full preview load on mobile/desktop connections. Record regions,
cache state, object sizes, and sample counts. Keep Blob serving previews if the R2
path regresses materially; originals can still use R2. Do not enable public bucket
URLs or shared authenticated-response caching to manufacture a faster result.
Cloudflare edge caching can improve R2 delivery, but storage choice alone does not
enable it. Any cache design must prove rating-reduction/withdrawal revocation.
[R2 read performance](https://developers.cloudflare.com/r2/how-r2-works/),
[Vercel private-storage guidance](https://vercel.com/docs/vercel-blob/private-storage)

## Next milestones

### Owner-only Atlas access and shared UI

Atlas owns its separate application and cloud API. Help extract/reuse the owned UI
package when needed without sharing Atlas admin permissions with website members.
Any valid Google website account is **not** an Atlas administrator. Owner access
must use verified Google identity and server-side allowlisting on every API/media
route. Prefer separate deployment environments and session audiences.

### Domain and content

The GitHub repository name does not attach the domain. Plan `jackrocca.com` for
the personal website and optionally `atlas.jackrocca.com` for private Atlas.
Before a domain cutover, verify personal ownership and existing DNS use, register
Google origin/callback, update `APP_URL`, then test a real sign-in. Preserve the
working canonical origin until then. Do not edit the separate old `jack-rocca`
Vercel project as a shortcut.

### Original download requests, later

Originals will live in a separate private R2 archive bucket managed by Atlas.
The website must not receive blanket original-bucket access. Build an explicit
request/approval policy and short-lived signed downloads only after verified
original upload/restore and access-policy work. No full-resolution downloads yet.

## Handoff and delivery rules

- Repository is public: only synthetic contract fixtures, never catalog exports,
  photos, identity records, tokens, or personal runtime data.
- Verify `docs/operations.md` account/project IDs before deploying. Main is the
  production branch after the repository cutover; feature branches use PRs.
- Run `npm run check` for storage/API changes. Add meaningful protocol/access tests,
  not tests that merely mirror implementation. Check the canonical deployment
  after release; never use league writes as test fixtures.
- First deliverable: agree the v1 interface with Atlas, then land the R2 adapter
  and publisher API with synthetic integration tests and rollback instructions.
- Cloudflare account and R2 credentials are **not provisioned by this handoff**.
  Verify Jack's personal account before creating resources; document bucket IDs,
  environments, permissions, and expected spend. No automatic bulk original upload.

## Platform notes

R2 Standard is currently $0.015/GB-month with free internet egress; roughly 2.91 TB
would be about $44/month for storage before allowances and operations. This is a
planning estimate, not a bill or committed purchase.
[Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/)

Cloudflare D1 is a candidate for the private catalog, not an approved blind import.
Its paid per-database ceiling is 10 GB, so the Atlas agent must measure growth,
large rows, indexing, query latency, and SQL compatibility first. Keep photos and
large artifacts in R2, and private face processing local by default.
[Cloudflare D1 limits](https://developers.cloudflare.com/d1/platform/limits/)
