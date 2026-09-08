# Hosting and accounts

The active Vercel project is `fantasy-football-pickem`, project ID `prj_iqeRjrObwpBb8fjmoMGWv9rVrdRp`, in the personal team `jacks-projects-3515a39f` (`team_dhku4KaMep8WhcDXvF5FUQKc`). It is separate from AM Rocca. Verify `vercel whoami` and the ignored `.vercel/project.json` before deployment.

The current canonical origin is https://fantasy-football-pickem-sigma.vercel.app. Public home is `/`; the league is `/pick4`; shared account is `/account`. The registered Google callback remains `/api/auth/callback/google`. Safe return destinations are signed into the OAuth flow. Google audience is in production with basic identity/email/profile access only.

`jackrocca.com` is not attached by this change. Changing the canonical domain also requires Google authorized origin and callback registration, `APP_URL`, and a real sign-in check. Do not alter the older `jack-rocca` project while deploying this app.

Environment values are documented in `.env.example` and README.md. Keep secrets in local ignored environment files or Vercel; never commit OAuth client secrets, Blob tokens, sessions, credential backups, or test-login routes. Preview deployments use a separate storage namespace. `.vercelignore` excludes upstream/legacy sources and original artwork from uploads.

After deploying, verify `/api/health` on the canonical alias, feed freshness, public page responses, the owner session on `/account` and `/pick4`, and Google’s registered callback. `/dev/ui` must return 404. Production league writes must never be used as disposable test data.
