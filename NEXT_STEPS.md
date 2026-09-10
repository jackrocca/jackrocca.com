# Personal website: next steps

The current coordinated Atlas release sequence is maintained in
`/Users/jack/jack-os/apps/photo-archivist/docs/private-release.md`. Follow that
sequence and this repository's `docs/operations.md`; dated entries below retain
the implementation history.

Current checkpoint: private Atlas is now served at `/atlas` in the existing personal
Vercel project. The current checkout is `/Users/jack/jack-os/apps/jackrocca.com`;
do not deploy the stale Documents/Codex checkout. The private gateway, R2 gallery
adapter and owner-only UI have been integrated while preserving the latest website
design and artwork. Production `dpl_DvhorMFySLVFFP5HKDcLgaWKLGym` includes the
complete generated private bundle; `.vercelignore` explicitly allows the
Git-ignored bundle into CLI deployments. See `docs/operations.md` for the deployed
version, packaging fix and release verification. All 44,285 private previews,
163 people, 195 albums and 36,917 face groups are active. The managed Mac API and
worker are online, and a read-only cloud-to-Mac command completed with HTTP 200.
Jack confirmed owner login and Workers Paid. Older roadmap entries
below describe the staged design and do not supersede this release checkpoint.

Local gateway source now also supports owner-only offline People lists,
relationship labels, and the default graph when Cloudflare advertises
`people-views-v1`. This addition is tested but not deployed. Deploy it with the
pending Atlas Cloudflare workflow release (migrations 0005 and 0006); older cloud
versions continue to use the Mac transport. Representative portraits now use the
private cloud media route when `face-thumbnails-v1` is available, with owner checks
and a 512 KiB response limit. Person photo collections now negotiate
`person-photos-v1`, use bounded pages, and preserve review status. The regenerated
private bundle handles both album/person pages with revision checks. These changes
are tested but not deployed. Individual photo details now negotiate
`photo-details-v1`, preserve native detail content and reject stale pinned revisions.
The existing staged catalog remains compatible; metadata refresh adds detail records
without reuploading verified previews. These gateway changes are also tested but not
deployed. See Atlas's `docs/reports/private-photo-details-2026-09-08.json`. Face
suggestions and alternate-version/original-media reads remain separate work. See Atlas's `docs/reports/private-person-photos-2026-09-08.json` and
`docs/reports/private-offline-portraits-2026-09-08.json`.

The latest local private bundle also refreshes the People overview after cluster
naming, assignment and ignore actions. Previously the overview could remain empty
even after the native command succeeded. The regenerated 69-file bundle and Atlas
native search/merge consistency fixes are verified but not deployed. See Atlas's
`docs/reports/private-cluster-operations-2026-09-09.json`.

The prepared private bundle now includes a searchable, paged face-group merge
picker, with direct unnamed-card and general source/destination flows. It uses the
existing owner command transport and requires the updated Mac cluster-list API for
paging/search. Actual synthetic browser merges and local regressions pass. This
addition remains pending deployment with the coordinated Atlas release. See
Atlas's `docs/reports/private-cluster-merge-ui-2026-09-09.json`.

The prepared private Atlas bundle additionally fixes duplicate review: all groups
are reachable through bounded pages, browser Trash/dismiss callbacks now work, and
partial trash/restoration keeps the remaining group visible. Synthetic owner HTTP
and mobile/keyboard browser checks passed; 218 UI tests and the website full check
passed. This bundle is prepared locally, not deployed. See the Atlas repository's
`docs/reports/private-duplicate-review-2026-09-09.json`.

The prepared private bundle also exposes named-place editing in Studio > Data
Labeling, including optional-field clearing, cancellation and protected queued
saves. Synthetic browser and owner-transport checks passed; 223 UI tests and the
website full check passed. This update is local and undeployed. See Atlas's
`docs/reports/private-named-place-editor-2026-09-09.json`.

The prepared private bundle also restores saved-search creation and adds rename,
filter replacement and display-order editing. Browser create/edit/delete checks,
228 UI tests, 80 native archive tests, two remote workflows and the website full
check passed. This update is local and undeployed; deploy the matching Mac API
change for explicit clearing of order on same-name saves. See Atlas's
`docs/reports/private-saved-searches-2026-09-09.json`.

The prepared private bundle additionally exposes manual annotation editing and
revision restoration in the photo inspector. Linked photo versions now share the
latest manual revision in details/history/search, and unrelated source IDs are
rejected by the matching Mac API. Synthetic browser/gateway checks passed with no
processing jobs; 233 UI tests and the website full check passed. This remains local
and undeployed. See Atlas's `docs/reports/private-annotation-editor-2026-09-09.json`.

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

The website opens with a centered supplied logo and a crossfading 4–5-star photo
hero. The masonry gallery is preserved at `/photography` but hidden from navigation;
Writing is removed for now. Projects is one minimal NFL / Pick 4 card. The working
single-league app at `/pick4` uses the site header above and its own compact menu
at the bottom. Do not add explanatory marketing copy.

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

The prepared private bundle now exposes album copy and selected-photo membership
removal from Pictures and Places album views. Synthetic browser/gateway checks
verify source/destination counts, preserved unrelated memberships and files, mobile
dialogs and keyboard confirmation. The matching Mac API fixes copy search refresh.
239 UI tests, typecheck, the hosted build and website full check pass. This remains
local and undeployed. See Atlas's
`docs/reports/private-album-memberships-2026-09-09.json`.

The prepared Atlas bundle now fixes Studio job status caching, overlapping polling
and misleading failed-start feedback after an accepted command. Bounded face-data
and GPS-name stages are exposed, and mobile command/console columns fit the screen.
A synthetic browser scan ran through the owner gateway and showed running then
completed without reload. This source is undeployed. See Atlas's
`docs/reports/private-pipeline-lifecycle-2026-09-09.json`.

The prepared Atlas bundle now includes Studio > Recent jobs > History, with bounded
cursor pages and old-result selection independent of current-job polling. Synthetic
browser and gateway checks reached 125 historical jobs without new processing or
file changes. The matching Mac API adds job cursors; this update is not deployed.
See Atlas's `docs/reports/private-job-history-2026-09-09.json`.

A 3.15 GB synthetic browser upload/download now has local end-to-end capacity
proof across 1001 parts, browser reload and a separate Mac transfer interruption.
The saved ZIP entry and staged upload matched the source SHA-256; all source and
preview bytes were preserved and no processing jobs ran. Staged uploads now retain
the automatic-processing choice across reload, and exports show immediate busy
feedback. 255 UI tests, six transfer tests, typecheck, the 69-file private build and
website full check pass. This update is local and undeployed. See Atlas's
`docs/reports/private-large-transfer-2026-09-09.json`.

The prepared Mac transfer code now accounts for cached parts when resuming with
limited disk space, and reclaims only unfinished transport assemblies/ZIPs before
capacity checks. Synthetic retries, cached corruption, lost receipts and source
preservation pass in 21 tests. This source is local and undeployed; see Atlas's
`docs/reports/private-transfer-disk-resume-2026-09-09.json`.

Bulk culling now edits each photo family once even when original and edited IDs
both appear in a selection; this fixes a double-rotation bug and inaccurate counts.
People/tag/place bulk labeling has owner-gateway queue and search evidence. Actual
browser rating/rotation/date saves preserve all synthetic files. 108 backend/gateway
tests, 259 UI tests, typecheck, private build and website check pass. This code remains
local and undeployed. See Atlas's `docs/reports/private-bulk-labeling-2026-09-09.json`.

Event suggestion, status, combination and merge workflows now have owner-gateway
acceptance checks. Local fixes refresh album search after those changes and reject
merging a parent into its descendant before any writes. 98 backend/gateway tests
pass; synthetic photos are preserved with no processing. This source is undeployed;
event browser/offline checks remain open. See Atlas's
`docs/reports/private-event-workflows-2026-09-09.json`.

The prepared event UI now guards duplicate submissions and stale album responses,
keeps other views intact while operations finish, and distinguishes saved changes
from refresh failures. A synthetic browser verified suggestion generation, navigation
while pending, confirmation and mobile 40px review targets. 266 UI tests, typecheck,
private build and website check pass. This update is undeployed. See Atlas's
`docs/reports/private-event-controls-2026-09-09.json`.

Prepared album/browse/event lists now exhaust bounded pages instead of stopping at
500 albums. Cloud reads remain pinned to one revision and reject partial lists.
The exact browser loader retrieved 602 confirmed albums and 601 child suggestions
through the owner gateway with the Mac offline. 272 UI tests, typecheck, private
build and website check pass. This source remains undeployed. See Atlas's
`docs/reports/private-complete-album-lists-2026-09-09.json`.

Atlas People merges now retain photo and face review decisions before duplicate
identity removal, with existing survivor decisions taking precedence. 105 related
backend/gateway tests pass, including two new hosted merge workflows. The Atlas
operation evidence report covers all 116 routes and distinguishes transport success
from full acceptance. These changes remain local; the private sync is still at
21/65 batches and production capacity, owner login and Mac pairing remain open.
See Atlas reports `private-people-merge-2026-09-09.json` and
`private-operation-coverage-2026-09-09.json`.

The prepared hosted library now reads totals, pending counts and camera/lens labels
from a private synchronized summary while the Mac is offline. Equipment renames
refresh labels without changing filter keys. 28 Cloudflare tests, 20 owner workflow
tests and the website full check (71 tests, 14 traces) pass. The optional document
remains compatible with older sync clients and cannot enable file deletion. Deploy
the updated Cloudflare validator before the new Mac sync; no additional migration
is needed beyond the already pending 0005/0006. This source remains undeployed.
See Atlas’s `docs/reports/private-offline-summary-2026-09-09.json`.

Studio now handles unavailable ZIP/job reads without claiming an empty inventory
or idle pipeline; ZIP filters ignore late responses and retain good data on a
same-filter refresh failure. A real synthetic browser queued one bounded scan
while the Mac worker was offline, reloaded, and observed completion after reconnect.
274 UI tests, four pipeline tests, typecheck, the 69-file private bundle and website
full check pass. The mobile ZIP filter is 40px tall and stays within a 390px viewport.
Source remains undeployed; real library files were untouched. See Atlas’s
`docs/reports/private-offline-job-handoff-2026-09-09.json`.

Owner publishing now has full gateway→Mac→website receiver checks for preview,
start, changed ratings, withdrawal, lost-upload retry, discard and stale review
rejection. A reproduced progress-write race is fixed by deferring catalog sync
after publication scheduling, as for processing jobs. Fast success also refreshes
the preview immediately; browser replay confirms zero changes and a disabled
Publish button. 40 backend/gateway tests, 279 UI tests, typecheck, private build
and website full check pass. All publishing used synthetic photos and an isolated
receiver; this source remains undeployed. See Atlas’s
`docs/reports/private-owner-publication-2026-09-09.json`.

Hosted journal Clear now uses the owner command path and awaits the Mac receipt;
reads/clears serialize, failures preserve the prior view, and fast follow-up failure
cannot erase a successful clear acknowledgement. Hosted controls identify Mac
activity and omit the ineffective pause switch; browser collection remains off.
A real synthetic browser cleared two events, refreshed to zero and retained zero
after reload. Mobile Clear is 40px tall with no horizontal overflow. Twelve
backend/gateway checks cover journal lifecycle and remaining read views, 286 UI
tests and typecheck pass, and the 69-file private build passes the website full
check (71 tests, 14 server traces). No real library files changed or cloud writes
ran. This source remains undeployed; release gates remain cloud capacity, full
sync, persistent worker pairing and real owner login. See Atlas's
`docs/reports/private-owner-journal-and-reads-2026-09-09.json`.

The complete Python suite passes with both companion-website integrations enabled:
559 tests, zero failures/skips. A read-only backup of the real catalog captured all
ten prepared offline workflow documents (195 albums, 163 people, 558 portrait
references) within existing bounds. The exact documents pass the prepared local
Cloudflare validator and D1 transaction: 566,403 stored bytes. Portrait encoding
was checked locally (10,162,433 bytes); no media was uploaded. API initialization
and reads used a disposable catalog copy, leaving the source database and photo
files untouched. The temporary private payload was removed after validation.
A fresh read-only production probe still reports 21/65 staging batches, 44,285
expected families, and zero probe writes. Cloud capacity, full sync, coordinated
release, persistent pairing, real owner login and remaining offline workflow
coverage are still open. See `docs/reports/private-release-preflight-2026-09-09.json`.

Default Duplicate Review now has an owner-only offline projection and summary,
with native group/keeper order, bounded pages, strict field validation and stale
revision rejection. Custom confidence thresholds retain the native Mac fallback.
A browser exposed and verified a startup fix: device discovery no longer delays
cloud views, and initial Duplicate Review cannot show a false empty result. The
final browser reloaded with “Mac offline,” paged all 52 synthetic groups by keyboard,
and verified 40px pagination controls without overflow at 390px. The real catalog’s
692 groups / 2,030 assets fit an 862,986-byte document; all eleven current documents
pass the local Cloudflare validator (1,429,389 stored bytes). 564 Python tests,
29 cloud tests, 288 UI tests, both typechecks, the 69-file private build and website
full check (71 tests, 14 traces) pass. No real photo or source-catalog files changed,
and no cloud writes ran. Deploy the compatible validator before the new Mac sync;
no migration beyond the already pending 0005/0006 is needed. Source is undeployed.
See `docs/reports/private-offline-duplicates-2026-09-09.json`.

A separate paged face-group index now handles the real archive’s 36,917 groups
without stuffing them into small workflow documents. Its 42 immutable parts
activate atomically; retries, stale source/page rejection, unknown-field privacy
validation and identical native filters/order pass. All real records matched across
74 local cloud-runtime read pages (5,536,260-byte capture); the source was read-only
and the temporary private payload was removed. Unnamed People now has 100-group
pages, handling stale filter responses and read failures. A synthetic browser
reached groups 601–602 by keyboard, reset filters correctly, and verified 40px
mobile paging controls without overflow. 568 Python tests, 32 cloud tests, 292 UI
tests, typechecks, the 69-file private bundle and website full check pass.

This adds pending migration `0007_cluster_views.sql` and `cluster-views-v1`.
The index is not production-ready yet: changed group content still uses a full
replacement snapshot, so bounded incremental updates are required before release.
Offline cluster portraits/photo detail and per-person suggestions also remain open.
Keep the preserved family upload plan; do not activate this group-index source in
production until incremental updates and the coordinated release are verified.
All work is local and undeployed. See `docs/reports/private-cluster-index-2026-09-09.json`.

Incremental group synchronization now resolves the full-replacement limitation in
the preceding checkpoint. A durable per-group hash baseline stages only changed
records and removal tombstones, then activates them with the page revision and
receipt in one guarded D1 transaction. Lost receipts replay safely, failed commits
roll back, and stale pages/bases fail closed. The pending, undeployed migration
`0007_cluster_views.sql` now separates the logical page revision from physical row
storage; apply its final schema with the compatible Worker and Mac sync release.

A read-only capture of all 36,917 real groups verified one simulated name edit as
one 175-byte uploaded record and exactly one active-row change, including commit
retry. All 74 local read pages matched the expected result; the temporary private
payload was removed. The source catalog and photo files were untouched. Cloud
capacity, the preserved family sync, offline cluster portraits/photos and person
suggestions, persistent pairing and real owner login remain open. No deployment,
production upload, billing change, commit or push ran. See Atlas's
`docs/reports/private-cluster-incremental-2026-09-09.json` for checks and evidence.

Validation: 571 Python tests with both website integrations enabled, 35 cloud
tests and cloud typecheck pass. This change has no UI or gateway source edits.

Unnamed group portraits now use the private group index and the existing bounded
thumbnail upload path. Closed thumbnail metadata is accepted only after object
verification, and owner reads require an active People/album or group reference.
Staged objects do not grant access; source/page changes and corrupt bytes fail
closed. Crop metadata is cached locally by filesystem identity and timestamps,
so a label edit does not re-read or re-encode unchanged crops. Regeneration or
missing crops update the incremental view; source crops remain untouched.

A synthetic owner browser with no worker running displayed three decoded portraits,
reloaded with “Mac offline,” and decoded all three again. At 390px all remained
visible without overflow or JavaScript errors; the fixture's source files and six
embeddings were preserved. A read-only real-archive inventory found 35,918 existing
representative crops across 36,917 groups; capture/stat checks took 1.458 seconds.
A sample of 100 encoded locally within the thumbnail bounds; none were uploaded.

This extends the final, still-pending migration `0007_cluster_views.sql` with an
indexed representative-face reference. Coordinate the compatible Worker and Mac
sync release. Offline group photo collections/face detail and per-person suggestions
remain open, along with cloud capacity, preserved full sync, persistent pairing and
real owner login. No production write, deployment, billing change, commit or push
ran. See Atlas's `docs/reports/private-cluster-portraits-2026-09-09.json`.

Validation: 573 Python tests with both website integrations enabled, 37 cloud
tests and cloud typecheck pass. A full-size synthetic index accepted 35,918 portrait
references in 42 parts (maximum 244,801 bytes); first/middle/last portrait reads
returned the exact uploaded bytes. No UI or gateway source changed this checkpoint.

Group photo collections now have an owner-only cloud read path with
`cluster-photos-v1`. Private family records include bounded group membership,
confidence and native matched-face/unknown-person counts. Pending migration
`0008_cluster_memberships.sql` maintains indexed memberships and coverage inside
the family transaction, including backfill of existing snapshots. Incomplete older
family records fail closed until the preserved initial plan and subsequent refresh
finish. Do not replace that initial plan or reupload already verified previews.

Collection pages retain native active-family/preview filtering and date order,
with family/group revision checks and bounded response bytes. The website negotiates
the capability and the UI assembles pages through the existing 20,000-photo limit.
Switching groups clears old photos and discards late responses. A browser-discovered
skipped-transition rejection is also handled without dropping the photo update.
A read-only capture of 44,285 real families contains 54,754 group memberships;
maximum record size is 26,791 bytes, and the largest active group has 374 photos.
No real catalog or media file was modified or uploaded.

Apply pending migrations 0005 through 0008 with the compatible Worker, website and
Mac sync release after the capacity gate. Individual face detail and per-person
suggestions remain open, as do full sync, persistent pairing and real owner login.
See Atlas's `docs/reports/private-cluster-photos-2026-09-09.json` for final checks.

Per-person suggestions and the review queue now use an exact, versioned local
cache through their existing owner API routes. A source identity/revision advances
inside transactions that change faces, embeddings, assignments/reviews, clusters,
photo metadata/status, previews or family mapping. Canonical query options preserve
separate fast/full/threshold/reference settings. Cached reads skip matching; the
counter does not advance for cache writes. Concurrent captures cannot be saved as
a newer revision, and the cache never commits another caller's pending edits.
Derived documents are bounded to 64 MiB total; responses are never truncated to fit.

Native scoring and owner review/undo/reassignment/merge checks pass. An owner API
integration verifies that repeated person and queue reads reuse matching, and a
person rename refreshes the result. A synthetic 2,000-candidate/512-dimension query
returned the identical 1,856,818-byte result in 0.0043s from cache versus 0.1388s
when matching. Embeddings are absent from cached results; no real archive was read
or modified for this checkpoint.

This is the prerequisite for publishing existing suggestions, not an offline cloud
read implementation yet. Next, synchronize current cached results and their source
token through a closed-schema paged protocol, reject stale/incomplete cloud reads,
and verify review/undo/reassignment. Cold queries and explicit matching remain on
the Mac. No new Cloudflare migration or website bundle is needed for this local
cache step; apply it through normal Mac app schema initialization at coordinated
release. Production capacity, preserved sync, pairing and real owner login remain
open. See Atlas's `docs/reports/private-suggestion-cache-2026-09-09.json`.

Previously computed People suggestions now synchronize through an owner-only,
versioned cloud cache. Native query options and face ordering are preserved;
cloud pages pin both the source version and the exact query snapshot. Queries
that have not been computed still use the Mac. Matching and embeddings remain
local. The Mac source watcher publishes newly cached queries on its next full
background sync; suggestion GET receipts do not wait for a full archive scan.

Uploads persist bounded parts before transmission, replay lost receipts, hide
incomplete captures and reject stale sources. Candidate thumbnails use verified
private objects and active references. Cloud activation enforces an 80 MiB query
bound and a 96 MiB active-query budget; obsolete rows and receipts drain in bounded
cleanup batches. No photo library files are removed by this cache cleanup.

This adds pending migration `0009_suggestions.sql` and `suggestion-views-v1`.
Apply migrations 0005 through 0009 with the compatible Worker, website and normal
Mac schema initialization. Keep the preserved initial family plan. Full suggestion
publication follows a coherent full family/workflow sync, including embedding-only
changes. This source remains local and undeployed. Production capacity, preserved
full sync, persistent Mac pairing and real owner login remain open.

Validation and synthetic browser evidence are recorded in
`docs/reports/private-cloud-suggestions-2026-09-09.json` in the Atlas repository.

The pending release now has a full local migration/resume rehearsal against the
preserved 65-part upload and all 44,285 current family documents. Starting with
migrations 0001–0004 and the same 21 accepted parts, upgrades 0005–0009 preserve the
active pilot and every staged row. The same saved parts resume, accepted-part and
commit retries remain idempotent, and all 302 current projection parts apply.
Every final family document matches the source capture exactly; all 54,754 group
memberships and complete family coverage are present. The local emulator database
measures 348,942,336 bytes before separate workflow/group/suggestion publication.
This is not a complete cloud storage estimate or production performance result.

The rehearsal takes 64.9 seconds locally and removes its temporary private payload.
It reads the real catalog and upload state read-only; media receipts are synthetic,
so actual R2 restoration is still a separate gate. All 43 cloud tests pass after
factoring the shared migration loader. See Atlas's
`docs/reports/private-release-rehearsal-2026-09-09.json`.

A fresh production probe still shows 21/65 parts, the original pilot active and zero
probe writes. The existing personal OAuth login was refreshed successfully; billing
subscription access is still 403, so a paid upgrade is unverified. Do not resume
writes before capacity is verified or the next UTC quota reset. The existing local
API passes identity/preservation checks and both prepared login agents validate,
but neither persistent service is loaded. LM Studio's configured port 1234 currently
refuses connections; restore its local service before annotation acceptance. No
annotation, import, production upload, deployment, billing change, commit or push ran.

Local processing dependencies are ready. LM Studio serves the configured
`gemma-4-31b-it-mlx` model at the native loopback endpoint with CORS disabled.
The restored 33.8 GB download resumed after a timeout and completed successfully.
Atlas's own request code loaded the model on demand and received `LOCAL_READY`
in 9.222 seconds from a text-only request. No image was submitted; this verifies
local model loading and transport, not photo annotation quality.

The accurate InsightFace runtime initialized all five face model components
without processing a photo. The public GeoNames dataset is cached locally with
69,700 cities; a synthetic coordinate resolves to New York City without sending
photo GPS anywhere. These checks made no catalog database edits. The existing
one-hour model idle TTL is unchanged, and the prepared Atlas login agents remain
inactive until the preserved full synchronization completes.

A reproduced failure loop is fixed: request-level annotation failures stop the
batch immediately, preserve earlier committed results, and surface a failed owner
job that can be retried after recovery. Nonempty malformed model output remains
preserved as partial data. The prepared Mac API login agent now restores the
default loopback model server before entering the existing Portless launcher;
it never downloads, loads or invokes a model, and leaves alternative endpoints
alone. Both prepared plists validate and remain inactive.

Validation: 592 Python tests, six focused owner/failure checks and five startup
checks passed at the code checkpoint. The live native text-only model check now
also passes. Production capacity, preserved full sync, coordinated release,
persistent pairing and real owner login remain open. See Atlas's
`docs/reports/private-model-readiness-2026-09-09.json` for evidence and
`docs/private-release.md` for the current release sequence.

People merge now publishes its pending state immediately, disables both selectors,
and shows Merging while the owner command runs. The selectors display person names
and retain stable options. A committed merge stays successful if follow-up reads
fail, and a late receipt cannot clear another profile's merge selection or feedback.
A keyboard browser merge through the synthetic owner gateway submitted once,
retained a rejected photo review, and updated the survivor to two photos. All
fixture photo bytes and embeddings were preserved. At 390px the merge controls
fit without page overflow and each measured 40px high. Screenshot capture was
unavailable; these mobile checks use DOM geometry and accessibility state.

This is local and undeployed. See Atlas's
`docs/reports/private-people-merge-ui-2026-09-09.json`. Non-empty ZIP inventory and
selection browser acceptance remains a local coverage gap, alongside the production
capacity, preserved sync, coordinated release, pairing and real owner-login gates.

ZIP inventory now has bounded 50-entry pages instead of stopping at 1,000 records.
Selections persist across pages, filter changes reset them, and job acceptance
clears only submitted names. Refresh preserves selections from other pages and
returns to the remaining last page after rows disappear. Rows show selection state,
prevent selecting non-ready ZIPs and fit mobile width with at least 40px height.

A synthetic owner test reached entry 1,001. The hosted browser selected ZIPs on two
pages and submitted Import by keyboard with fallback limit 1: exactly the two
selected ZIPs imported, one unselected ZIP remained ready, and every source ZIP,
existing photo and imported original passed byte-preservation checks. No annotation
or face processing ran. UI tests (308), typecheck, five native pipeline checks,
69-file bundle build and website checks pass. This is local and undeployed; see
Atlas's `docs/reports/private-zip-selection-2026-09-09.json` for evidence and limits.
Production capacity, preserved sync, coordinated release, pairing, real owner login
and canonical operation acceptance remain open.
