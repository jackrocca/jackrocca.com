# Atlas → personal website publication contract

Version 1 handoff, September 8, 2026. **Proposed interface; not implemented yet.**
This file in `jackrocca/jackrocca.com` is the canonical shared contract. The Atlas
agent should pin an agreed commit when implementing its client. Breaking changes
require a new version and coordination between both repositories.

## Ownership and invariant

Atlas owns the canonical local catalog, family selection, preview encoding, local
pending changes, and the publishing action. The website owns the publication API,
R2 gallery adapter, validation, and all viewer authorization. Neither application
should directly modify the other's operational database. The published catalog is
a replaceable read projection, never a second editable catalog.

Keep the existing catalog v1 schema from `lib/photography.ts`: `version`, `revision`,
`publishedAt`, and `photos`; photo records use opaque `id`, `rating`, `width`,
`height`, content-addressed relative `preview`, `takenAt`, optional `capturedAt`,
`place`, and approved `people`. Preserve the existing exporter ID algorithm, family
selection, date normalization, and revision algorithm when extracting it. Do not
silently mint new IDs for the same archive. Lock behavior with synthetic golden
fixtures shared or copied at an explicitly pinned revision.

## Visibility

- Public: active ratings 3–5, metadata redacted as today.
- Website Google members: active ratings 1–5 plus approved published labels.
- Zero/unrated, deleted, trashed, and withdrawn: excluded entirely.
- Atlas owner: separate authorization boundary; membership never grants admin.
- Do not include originals, paths, EXIF/GPS, private notes, face crops, embeddings,
  or hidden/private identity associations. The publication contains web previews.

## Proposed publisher protocol

Endpoint names below are the agreed starting design, not existing callable routes.
Server-to-server publisher authentication is distinct from browser login. Use a
rotatable credential scoped only to one gallery environment, stored server-side
or in the local credential store. Require TLS; do not put credentials in URLs.

1. `POST /api/photo-publications/v1/begin`: submit `baseRevision`, proposed
   `revision`, and an idempotency key. Return `publicationId`, state, and the current
   published revision. A stale base yields 409; the first publication uses null.
2. `POST /api/photo-publications/v1/:id/uploads`: bounded batches of declared
   preview hashes/sizes and the manifest hash/size. Return only missing-object
   upload authorizations. Browser-sized API payloads only; use signed direct R2
   uploads for files and large manifests. All keys and size limits are determined
   by the server, with short expiration and strict environment isolation.
3. `POST /api/photo-publications/v1/:id/commit`: reference the uploaded manifest.
   Validate schema, limits, revision, dimensions/content, expected hashes, and
   successful upload of every referenced object. Then atomically promote if the
   base revision is still current. Use R2 conditional writes or an equivalently
   proven serialized commit mechanism; verify concurrency in integration tests.
4. `GET /api/photo-publications/v1/:id`: authenticated status with uploaded/missing
   counts, validation failures, resulting revision, and completion timestamp.

Choose explicit byte/count/expiry limits before implementation and test their
boundaries. Store durable publication status so process restarts can resume safely.
Bounded validation jobs may be needed; do not assume a full archive fits one
serverless invocation. A failed or incomplete publication must leave the old
catalog intact. A repeated successful commit returns the original success.
After a 409, Atlas refreshes the base and asks for/rebuilds a new publication;
never force an overwrite silently.

Preview object hashes establish integrity and deduplication, not authorization.
Serve image requests only after checking the latest published catalog and session.
Objects removed from a catalog can remain private for rollback; garbage collection
is a separate, deliberate operation. Do not create public R2 bucket URLs that
bypass a later rating reduction or withdrawal.

## Environment and storage boundaries

Use separate private gallery storage for production and preview, and a separate
private original archive bucket. Website runtime needs read access to gallery
objects only. The publisher needs gallery write/commit access only. Atlas original
upload credentials must not authorize website or league writes. Existing Vercel
Blob league state is outside this protocol.

## Contract tests required in both repositories

Use synthetic photos and identities only. Cover stable IDs/revisions, rated edit
selection, privacy filtering, newest-first order, 2→3 and 3→2 changes, withdrawals,
checksum mismatch, interrupted upload, expired authorization, credential revocation,
concurrent/stale commit, duplicate retry, and preview/production isolation. Test
that old direct image URLs stop working when current access is revoked.

## Current compatibility path

Until this API is implemented, `scripts/sync-photos.ts --publish` remains the
working CLI publisher to private Vercel Blob. Do not remove it or change production
storage until the replacement has passed end-to-end validation. The Atlas agent
may prototype its Publish action with a local adapter around the existing command,
but it must not depend permanently on an absolute path to this checkout, duplicate
the exporter silently, or expose production environment files to the UI.
