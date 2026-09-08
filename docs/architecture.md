# Architecture

One Next.js application serves Jack Rocca’s public personal site and his single Pick 4 league. No account is required for public pages. Google sign-in creates one account and automatically enrolls that user in the league; the verified owner email controls commissioner access.

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

Public identity and links live in `lib/site.ts`. Homepage tile order, destinations, and optional selected photo paths live in `lib/home-grid.ts`; the homepage has no visible captions or introductory copy. The photography tile uses a camera mark until actual portfolio images are selected. UI tokens live in `ui/theme.css`. The site uses one self-hosted font through Next/font; the supplied signature is its primary brand asset. The league maintains a compact layout and semantic status labels without a separate decorative theme.

The UI dependency direction is application → UI. Shared components cannot import account or league code. `npm run check:boundaries` enforces this and rejects runtime imports from archived/upstream source.

The backend uses private Vercel Blob state with conditional ETag writes and bounded retries. Server handlers enforce authorization, CSRF origin checks, frozen-line selection, deadlines, unique games, powerup availability, and stale-card revision conflicts. Read-time scoring prevents refreshes from accumulating duplicate points. Keep this model authoritative; UI controls never replace server checks.
