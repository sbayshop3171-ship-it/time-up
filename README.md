# Sk88bd — Gaming Platform

Next.js (App Router) + TypeScript. Bangla-first, BDT (৳), mobile-first
phone-width column centred on desktop.

New here? Read **[SETUP.md](SETUP.md)** first — it covers both apps in this
repo (the Next.js front-end at the root and the Laravel + Inertia port in
`laravel/`), the local setup steps and the secrets you need from the owner.

Reference build for a client. The design follows a competitor site's layout
and flow; the brand, code, copy and artwork here are our own — no provider or
competitor assets are copied. Game thumbnails are CSS gradients + a glyph on
purpose: real game art belongs to the providers and must be served from their
CDN under licence.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## GitHub + live deploy

GitHub remote:

```bash
git remote -v
git push origin main
```

Recommended live host for the root Next.js app is Vercel. Import this GitHub
repo in Vercel, keep the framework as Next.js and set these environment
variables in the Vercel project:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CRAZY_TIME_LAUNCH_URL=
```

After that, every push to `main` can be deployed by Vercel automatically.

VPS/FASTPANEL server deploy is also prepared for the `astbgs-live` SSH host:

```bash
scripts/setup-live-push.sh
git push origin main
```

That push sends the same commit to GitHub and the server bare repo. The server
hook checks out the code to `/var/www/tafsir/data/deployments/time-up-repo`,
builds it and runs the Next.js app in PM2 as `time-up` on port `3001`.

## Layout

```
app/
  layout.tsx          root shell (AppShell + globals.css)
  page.tsx            home
  globals.css         all styling; design tokens in :root
  login/ register/ forgot-password/
  deposit/ withdraw/ deposit-history/ withdraw-history/
  member/ my-profile/ account-statement/ bets-history/
  balance-overview/ turnover/ security/
  promotions/ refer/ reward/ vip/
  casino/ casino/[id]/
  sports/ support/ download/
components/           shared UI (chrome, cards, forms)
lib/
  brand.ts            name, wordmark halves, currency, socials
  strings.ts          every user-facing Bangla string
  catalogue.ts        game data (placeholder → Supabase `games` later)
  payments.ts         deposit/withdraw channels + limits
  promotions.ts       bonus offers + VIP tiers
legacy/               the earlier static HTML build, kept for reference
```

## Re-branding

1. `lib/brand.ts` — `name`, `light` + `accent` (the two wordmark halves),
   `domain`, socials.
2. `app/globals.css` `:root` — `--gold`, `--mint`, `--bg*`, `--surface*`.

Nothing else hard-codes the brand.

## Status

Front-end is complete and builds clean. Not yet wired:

- **Auth / accounts / wallet** — needs a Supabase project. Forms validate and
  show a toast; no network calls yet.
- **Games** — `casino/[id]` can render provider previews. Crazy Time uses
  `CRAZY_TIME_LAUNCH_URL` for a full-screen launch frame.
- **Sports odds** — sample fixtures only. Needs an exchange/sportsbook feed.
- **Admin panel** — not started.

## Note

Demo build. No real payments, no real accounts, no real games. 18+.
