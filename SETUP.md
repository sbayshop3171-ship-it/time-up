# Developer setup

Two apps live in this one repo:

| Path        | What it is                                             | Status |
|-------------|--------------------------------------------------------|--------|
| `/` (root)  | Next.js 16 + React 19 front-end, deployed to Vercel      | builds clean, front-end only |
| `laravel/`  | Laravel 12 + Inertia + React port (the app being built) | active work happens here |
| `legacy/`   | the original static HTML build                          | reference only, do not edit |

Owner account for everything (GitHub, Supabase, Vercel, support mailbox):
**mpmony1@gmail.com**

## Requirements

- PHP 8.4 with the usual Laravel extensions
- Composer 2
- Node 20+
- MySQL 8 (SQLite also works for local dev)

## Laravel app (`laravel/`)

```bash
cd laravel
composer install
cp .env.example .env
php artisan key:generate
```

Then set the DB credentials in `.env`. For MySQL, create the database first:

```sql
CREATE DATABASE sk88bd CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sk88bd'@'localhost' IDENTIFIED BY 'change-me';
GRANT ALL ON sk88bd.* TO 'sk88bd'@'localhost'; FLUSH PRIVILEGES;
```

For a quicker start, put `DB_CONNECTION=sqlite` in `.env`, delete the other
`DB_*` lines, and `touch database/database.sqlite`.

```bash
php artisan migrate --seed
npm install
composer run dev      # serves Laravel + Vite + queue together
```

Front-end code is Inertia + React under `resources/js/`
(`pages/`, `components/`, `layouts/`, `lib/`). Server routes are in
`routes/web.php`.

## Next.js app (root)

```bash
npm install
cp .env.example .env.local     # fill in Supabase + game launch URLs
npm run dev                    # http://localhost:3000
npm run build
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only — never prefix it `NEXT_PUBLIC_`
and never import it into a client component.

`CRAZY_TIME_LAUNCH_URL` should be a fresh provider/aggregator launch URL for
the current site/session. Do not commit real launch tokens; keep them in
`.env.local` locally and in the hosting provider's environment variables.

`supabase/schema.sql` is the Supabase schema for this app. `.vercelignore`
keeps `laravel/`, `legacy/`, `docs/` and `scripts/` out of the Vercel build.

## GitHub to live workflow

1. Push code to GitHub:

   ```bash
   git add .
   git commit -m "Update site"
   git push origin main
   ```

2. Import the repo into Vercel as a Next.js project.
3. Add the environment variables from `.env.example` in Vercel.
4. Keep production updates simple: edit locally, test with `npm run build`,
   commit, push to `main`, then Vercel deploys the new version.

## What is NOT in this repo

These are gitignored and have to be supplied separately by the owner:

- `.env.local` (root) — Supabase URL + keys
- `laravel/.env` — `APP_KEY`, DB credentials
- anything generated: `node_modules/`, `laravel/vendor/`, `.next/`,
  `laravel/public/build/`

## Re-branding

`lib/brand.ts` (Next.js) and `laravel/resources/js/lib/brand.ts` (Laravel) hold
the name, wordmark halves, domain, support email and socials. Colours are the
`:root` custom properties in the global stylesheet. Nothing else hard-codes the
brand.

## Ground rules

- Read `AGENTS.md` at the repo root and `laravel/CLAUDE.md` before writing code.
- Run `vendor/bin/pint --dirty` after touching PHP.
- Run `php artisan test` before pushing Laravel changes.
- Do not commit `.env` files, real API keys, or provider game assets.
- Game thumbnails are CSS gradients on purpose — real game art belongs to the
  providers and needs a licence.
