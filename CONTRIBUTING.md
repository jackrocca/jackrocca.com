# Development

Use Node 22 (`nvm use`) and `npm ci`. Copy `.env.example` to `.env.local`, fill the documented local secrets, then run `npm run dev`. Never copy production data or tokens into test fixtures.

## Before opening a pull request

- `npm run format` formats maintained source; upstream snapshots, artwork, data, and archived code are excluded.
- `npm run check` verifies formatting, upstream checksums, UI dependency boundaries, types, unit/API tests, and the production build.
- `npm audit --omit=dev` checks production dependencies.
- Exercise changed UI on desktop and at 390px width, including keyboard navigation and loading/error/disabled states. `/dev/ui` is the local workshop.

CI runs these same checks without production credentials. Integration tests seed isolated identities through internal functions and remove their temporary stores; never add a public test-login endpoint.

Keep changes on a feature branch and review the diff. A commit, a push, and a production deployment are separate actions. Do not deploy from a default Vercel account without verifying its identity and the linked project.

For a UI change, start at `ui/theme.css` or an existing component. See `ui/README.md` for source-fork and upstream-update instructions. See `docs/architecture.md` for application boundaries and `docs/operations.md` for hosting.
