# Photo Archivist → website

Atlas remains the local authoring application and SQLite source of truth. The website
is a read-only gallery of a deliberately published snapshot. There is no second
catalog to reconcile, no cloud face processing, and no public link to the Mac.

## Visibility

- Visitors: active 4–5-star previews only. No people, dates, or location metadata.
- Any valid Google account: active 1–5-star previews and published people/place labels.
- Unrated, deleted, and trashed assets: never exported.
- Only confirmed/manual people associations with normal privacy and no hidden flag
  are published. Private notes, relationships, aliases, descriptions, face crops,
  embeddings, EXIF, original filenames, and exact GPS never leave the archive.
- Ratings and deletions take effect on the next explicit publication. This is a
  snapshot integration, not a background watcher. Changes made in Atlas do not
  immediately change the website.

Every photo-list and image request checks access server-side against the current
catalog. Responses use `private, no-store` and vary on the session cookie. Image
objects live in private Blob storage; opaque URLs are not an authorization mechanism.
Next Image is unoptimized for this protected route so a shared image-optimizer cache
cannot expose a member image. The web files are already resized and compressed.

## Publishing

Run from the website repository. Python 3 and the npm development dependencies are
required. The source path is configurable; the default is Jack’s current local archive.

```sh
npm run photos:sync
```

This reads `/Users/jack/jack-os/media/photography/catalog/photography.sqlite` and the
existing preview files, writes WebP copies with a maximum 1280px edge under ignored
`work/photography`, and prints counts. It does not modify Atlas or originals. The
read-only SQLite connection uses WAL coordination when a WAL exists; otherwise the
main DB is read immutably and its timestamp/size checked for concurrent changes.

Use `--archive-root PATH` for another archive. Highest-rated version in each annotation
family wins; ties prefer the Atlas representative. This preserves rated edits when
older version families have inconsistent ratings. Output must remain under `work/`.

Review locally with `npm run dev`. To publish to the existing private store, load the
personal Vercel project's production environment into an ignored, mode-600 file:

```sh
npx vercel env pull work/photos-production.env --environment production \
  --scope jacks-projects-3515a39f \
  --global-config /Users/jack/Documents/Codex/2026-09-08/can-x20/work/vercel-jrocca
chmod 600 work/photos-production.env
node --env-file=work/photos-production.env --import tsx scripts/sync-photos.ts --publish
```

Never paste or commit that file. Preview publications use `--prefix photography/preview`
and the appropriate preview environment. Runtime prefixes are environment-specific;
`PHOTO_STORAGE_PREFIX` is an explicit override. Development reads `work/photography`
unless `PHOTO_LOCAL_DIR` is set, and refuses filesystem fallback on Vercel/production.

Uploads are bounded to four concurrent requests. Content-hashed previews upload before
an atomic conditional catalog replacement. Unchanged previews are skipped. A failed
upload leaves the old catalog in service; concurrent publications cause a conflict,
not a silent overwrite. Removed files may remain in private storage, but the serving
route no longer exposes them. No destructive bucket garbage collection runs implicitly.

## Browsing and scope

All photo grids default to capture time, newest first, with undated photos last.
People and Places collections use their newest visible photograph as the cover and
follow that same order. Ratings select visibility and filters, not ordering.

The member gallery supports paging, exact star filters, text search over published
people/place/date labels, People and Places collections, and a keyboard-accessible
photo viewer. Collections use whole-photo covers, not face crops. An unlabeled place
stays unlabeled; the exporter does not call a geocoding or annotation service.

As of the first export, 670 ranked photo families are available, with two public
4–5-star photos and 50 named people. No place labels exist in the source catalog yet.
The Places view will populate when labels are added in Atlas and republished.

Full-resolution downloads are intentionally a later feature. No original upload,
request queue, or download button is implemented by this change. Future requests can
use the deterministic exported photo ID to resolve an original locally; avoid putting
original filesystem paths into the website catalog.

## Verification

`npm run check` includes API tests for anonymous/member image access, guessed URLs,
invalid sessions, session revocation, rating reductions, withdrawn photos, metadata
redaction, and malformed publications. `npm run test:photo-export` tests the SQLite
projection on a synthetic temporary archive. Never add a production test-login route.
