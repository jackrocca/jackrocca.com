# Architecture

One Next.js application serves Jack Rocca’s public personal site and his single Pick 4 league. No account is required for public pages. Google sign-in creates one account and automatically enrolls that user in the league; the verified owner email controls commissioner access.

| Directory                        | Responsibility                                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------ |
| `app/`                           | Routes, layouts, styles, and HTTP handlers                                                 |
| `components/`                    | Site and league compositions, providers, the public Rocca UI library at /ui                |
| `ui/`                            | Our customizable UI source fork, independent of application models                         |
| `lib/`                           | Account/session logic, league domain, validation, storage, data feed, public site identity |
| `data/`                          | Verified current-season schedule fallback                                                  |
| `tests/`, `scripts/check-api.ts` | Scoring, account/security, concurrency and API verification                                |
| `scripts/`                       | Maintenance and deterministic repository checks                                            |
| `vendor/kitze-ui/`               | Immutable upstream registry snapshot and source checksums; not imported at runtime         |
| `assets/brand/`                  | Original supplied artwork; the navbar copy changes only SVG canvas bounds                  |
| `legacy/`                        | Preserved original Streamlit implementation and historical data; not deployed              |

Public identity and links live in `lib/site.ts`. The home route uses `components/photo-hero.tsx`, a crossfading selection of 4- and
5-star photographs. The full gallery remains available directly at `/photography`
using `components/photo-gallery.tsx`, but is hidden from navigation. Writing is
removed for now; Projects contains two minimal cards, Pick 4 and Rocca UI (`/ui`). The site header exposes Projects and Account through a hamburger menu at every
screen size. Both account and league sign-in screens use `components/sign-in-page.tsx`;
the signed-in account controls stay in `components/site-account.tsx`. UI tokens live
in `ui/theme.css`.

`lib/ui-catalog.ts` is the component catalog and `/ui/llms.txt` is generated from it.

Photo Archivist SQLite remains the catalog authority. `scripts/photography/read_catalog.py`
reads it without migrations or writes; `scripts/sync-photos.ts` derives a versioned private
publication of ranked previews. `lib/photography.ts` validates the projection and applies
visibility; `lib/photo-store.ts` reads it; `/api/photos` and `/api/photos/image/:id` enforce
Google session access on every request. The browser never gets Blob paths or originals.
See `docs/photography.md` for publication and privacy boundaries.

The UI dependency direction is application → UI. Shared components cannot import account or league code. `npm run check:boundaries` enforces this and rejects runtime imports from archived/upstream source.

The backend uses private Vercel Blob state with conditional ETag writes and bounded retries. League chat lives in a sibling `chat.json` object so message writes do not contend with pick saves; profile photos are stored as private square WebP files and served only to signed-in members through `/api/avatars/:userId`. Server handlers enforce authorization, CSRF origin checks, frozen-line selection, deadlines, unique games, powerup availability, and stale-card revision conflicts. Read-time scoring prevents refreshes from accumulating duplicate points. Keep this model authoritative; UI controls never replace server checks.
