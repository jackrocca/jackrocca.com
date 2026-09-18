# Architecture

One Next.js application serves Jack Rocca’s public personal site and his single Pick 4 league. No account is required for public pages. Google sign-in creates one jackrocca.com account (`lib/accounts.ts`, keyed by Google `sub`); Pick 4 membership is a league concern layered on that account. During the 2026 season every account is enrolled in the league at sign-in; the verified owner email controls commissioner access.

| Directory                        | Responsibility                                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------ |
| `app/`                           | Routes, layouts, styles, and HTTP handlers                                                 |
| `components/`                    | Site and league compositions, providers, local UI workshop                                 |
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
removed for now; Projects contains a single minimal Pick 4 card. The site header exposes Projects and Account through a hamburger menu at every
screen size. Both account and league sign-in screens use `components/sign-in-page.tsx`;
the signed-in account controls stay in `components/site-account.tsx`. UI tokens live
in `ui/theme.css`.

Photo Archivist SQLite remains the catalog authority. `scripts/photography/read_catalog.py`
reads it without migrations or writes; `scripts/sync-photos.ts` derives a versioned private
publication of ranked previews. `lib/photography.ts` validates the projection and applies
visibility; `lib/photo-store.ts` reads it; `/api/photos` and `/api/photos/image/:id` enforce
Google session access on every request. The browser never gets Blob paths or originals.
See `docs/photography.md` for publication and privacy boundaries.

The UI dependency direction is application → UI. Shared components cannot import account or league code. `npm run check:boundaries` enforces this and rejects runtime imports from archived/upstream source.

Game detail (`/api/game/:id`) reads ESPN's public event summary on demand for games on the league schedule, with a short per-instance memory cache; it is never written into league state. `npm run seed:local` fills the isolated local store with fixture members and cards for trying the board without Google sign-in and refuses to run with Blob credentials present.

The backend uses private Vercel Blob state with conditional ETag writes and bounded retries. League chat lives in a sibling `chat.json` object so message writes do not contend with pick saves; profile photos are stored as private square WebP files and served only to signed-in members through `/api/avatars/:userId`. Server handlers enforce authorization, CSRF origin checks, frozen-line selection, deadlines, unique games, powerup availability, and stale-card revision conflicts. Read-time scoring prevents refreshes from accumulating duplicate points. Keep this model authoritative; UI controls never replace server checks.

## Weekly deadline and line snapshots

All of this lives in `lib/rules.ts`; `lib/view.ts` applies it to what each member may see, and `lib/sync.ts` runs the scheduled parts from the cron.

- **Card deadline** (`deadline`): the first Sunday kickoff of the main slate (the earliest Sunday game at or after 09:00 PT, normally 10:00). Every slot is due then, Sunday night and Monday night included. Weeks without Sunday games fall back to the earliest kickoff. Week 1's Sunday deadline is no longer a special case.
- **Early games** (`weekendGame` false): anything kicking off before the deadline — Thursday, Friday/Saturday games, 06:30 PT international Sunday games. Using one is optional. Once it kicks off, that slot on a saved card is final (`saveEntry` keeps the frozen selection) and the rest of the card stays editable until Sunday. A started game can never be added to a card.
- **Late** (`entryLate`): derived on read from `submittedAt >= deadline`, never trusted from the stored flag, so a deadline change cannot strand a saved card. A late card (saved after the deadline) may use only unstarted games, scores −1 with a floor of 0, cannot use powerups, and locks on save.
- **Powerups** lock with the slot they affect: Super Spread with the favorite's game, Total Helper with the chosen total's game, Perfect Prediction with the first game on the card to kick off (it would otherwise be declared with one result already known).
- **Reveal** (`slotLockTime`): another member's slot is visible from its game's kickoff or the deadline, whichever is first. Powerups reveal with the slot they affect. `view()` redacts slot by slot (`null` until visible) and `gamePicks` counts every visible card once any game has kicked off.
- **Two snapshots**: `publishWeek` runs from Wednesday 09:00 PT (`freezeTime`) and freezes every unstarted game with a real line; those numbers are final for early games and provisional for the rest. `publishWeekend` runs from Saturday 09:00 PT (`weekendFreezeTime`) and refreezes games at or after the deadline, then rebases saved picks on them (`rebaseWeekendPicks`): a spread pick keeps its team at the new number, a total takes the new total, the old line is kept in `Selection.movedFrom` until the member saves again, and a Super Spread whose favorite no longer gives 5 is released unused. Both snapshots refuse to run after the deadline and never take a line from a game that has kicked off. The commissioner may run either early through `admin/publish` (`snapshot: "opening" | "weekend"`) and may set a game's line until that game's own snapshot has run. `Week.weekendPublishedAt` is optional; weeks played before this rule simply never had one.
