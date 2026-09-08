# Hosting and accounts

The active Vercel project is `fantasy-football-pickem`, project ID `prj_iqeRjrObwpBb8fjmoMGWv9rVrdRp`, in the personal team `jacks-projects-3515a39f` (`team_dhku4KaMep8WhcDXvF5FUQKc`). It is separate from AM Rocca. Verify `vercel whoami` and the ignored `.vercel/project.json` before deployment.

## Ownership and deployment audit — September 8, 2026

- GitHub identity: `jackrocca`. This website is the public repository `jackrocca/jackrocca.com`, renamed from `fantasy-football-pickem` with its history and pull requests preserved; Atlas is the private repository `jackrocca/photo-archivist`.
- Vercel identity: `jackrocca`, account `jrocca98@gmail.com`. The personal team above is on Pro. Use the isolated CLI configuration at `/Users/jack/Documents/Codex/2026-09-08/can-x20/work/vercel-jrocca` with `--scope jacks-projects-3515a39f`; the default CLI login may belong to AM Rocca.
- Pull request #3 is merged into `main` (merge commit `a286888`). The website rebuild and its history are now on the default branch.
- The existing Vercel project is connected to `jackrocca/jackrocca.com` (GitHub repository ID `1050047135`), with `main` as its production branch. GitHub sign-in is linked to the personal Vercel identity. Pushes to `main` trigger production deployments; use pull requests for future changes and verify both GitHub CI and Vercel deployment status.
- The Vercel project retains its existing name and canonical URL to preserve routing and Google callbacks. A repository rename does not require a new Vercel project, storage store, or domain cutover.
- No Atlas Vercel project exists in this team yet. An owner-only cloud Atlas is proposed future work; this audit does not provision it or upload originals.

## Production operations

The current canonical origin is https://fantasy-football-pickem-sigma.vercel.app. Public home is `/`; the league is `/pick4`; shared account is `/account`. The registered Google callback remains `/api/auth/callback/google`. Safe return destinations are signed into the OAuth flow. Google audience is in production with basic identity/email/profile access only.

`jackrocca.com` is not attached by this change. Changing the canonical domain also requires Google authorized origin and callback registration, `APP_URL`, and a real sign-in check. Do not alter the older `jack-rocca` project while deploying this app.

Environment values are documented in `.env.example` and README.md. Keep secrets in local ignored environment files or Vercel; never commit OAuth client secrets, Blob tokens, sessions, credential backups, or test-login routes. Preview deployments use a separate storage namespace. `.vercelignore` excludes upstream/legacy sources and original artwork from uploads.

After deploying, verify `/api/health` on the canonical alias, feed freshness, public page responses, the owner session on `/account` and `/pick4`, and Google’s registered callback. `/dev/ui` must return 404. Production league writes must never be used as disposable test data.

Check the deployment's GitHub repository, commit SHA, production target, and alias;
`Ready` alone does not prove that the canonical site serves the expected commit.
Both local checkouts retain their existing filesystem locations; the website's
remote URL is `https://github.com/jackrocca/jackrocca.com.git`.
