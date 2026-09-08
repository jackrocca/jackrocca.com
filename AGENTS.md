<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Repository conventions

- Supported runtime: Node 22 / Next.js app at the repository root. `legacy/` is an archive, not the app.
- Read `docs/architecture.md` before moving module boundaries. The UI fork in `ui/` must not import app/domain code.
- Modify `ui/`, never the accepted snapshot in `vendor/kitze-ui/`. See `ui/README.md` before updating or adding registry components.
- Preserve supplied artwork in `assets/brand/`. Branding and navigation must not invent personal content or portfolio photographs.
- Run `npm run check` for structural changes; run targeted tests and a production build for smaller changes. Verify responsive and keyboard behavior for affected controls.
- Never add public development authentication endpoints. Tests use isolated local stores through internal functions.
- Keep production deployment, remote push, and merge distinct. Verify the personal Vercel team before any deploy; see `docs/operations.md`.
