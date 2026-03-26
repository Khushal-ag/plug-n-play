# CMS Bundle

Drop this `cms/` folder into any Next.js App Router project (using `src/app`) to get:

- Admin panel at `/admin`
- DB-backed page editor (HTML + metadata + assets)
- Public routes by slug
- Sitemap and robots routes

This bundle uses Turso/libSQL so the same setup works on VM, VPS, and serverless deployments.

## Requirements

- Node 20.9+
- Next.js App Router with `src/app`
- A Turso/libSQL database URL

## Install

1. Copy `cms/` to your project root (next to `package.json`).
2. Run:
   - `node cms/install.mjs`
3. Create `.env.local` from `.env.example` and set required values.
4. Start the app and open `/admin`.

### Installer flags

- `--dry-run`: show what will change, without writing files
- `--skip-install`: skip dependency install
- `--no-public-routes`: copy admin + asset routes only

## Required env vars

| Variable               | Required | Description                             |
| ---------------------- | -------- | --------------------------------------- |
| `ADMIN_PASSWORD`       | yes      | Admin login password                    |
| `TURSO_DATABASE_URL`   | yes      | Turso/libSQL connection URL             |
| `NEXT_PUBLIC_SITE_URL` | yes      | Canonical site URL for metadata/sitemap |

## Optional env vars

| Variable                              | Description                                       |
| ------------------------------------- | ------------------------------------------------- |
| `TURSO_AUTH_TOKEN`                    | Turso auth token (required for hosted DBs)        |
| `NEXT_PUBLIC_CMS_ADMIN_BASE`          | Admin base path (default `/admin`)                |
| `NEXT_PUBLIC_CMS_BRAND_NAME`          | Admin brand title                                 |
| `NEXT_PUBLIC_CMS_BRAND_TAGLINE`       | Admin subtitle                                    |
| `NEXT_PUBLIC_CMS_DEFAULT_DESCRIPTION` | Fallback meta description                         |
| `NEXT_PUBLIC_IMAGE_HOSTS`             | Comma-separated remote image hostnames            |
| `CMS_ADMIN_SESSION_HOURS`             | Admin login session expiry in hours (default `6`) |

## What the installer sets up

- Copies `cms/routes/app` into `src/app`
- Adds `@cms/*` path alias to `tsconfig.json` (if possible)
- Creates `drizzle.config.ts` (if missing)
- Appends CMS env keys to `.env.example` (if missing)
- Installs dependencies from `cms/deps.json` (unless `--skip-install`)

## Database behavior

- Tables and indexes are auto-created on first run.
- Seed `home` page is created if missing.
- `drizzle-kit push` is optional for quick start.

## Route structure

- Admin: `/admin`, `/admin/dashboard`, page editor routes
- Public pages: `/` and `/{slug...}`
- Asset routes:
  - `/cms-assets/{slug}/{filename}`
  - `/cms-global-assets/{filename}`
- SEO routes:
  - `/sitemap.xml`
  - `/robots.txt`

## Content model

- Each page stores:
  - `slug`, `title`
  - `html`
  - `meta description`, `meta keywords`
  - `publish status`
  - page-level assets

## Optional shared header/footer

If you create these files, they are injected by the `(site)` layout:

- `src/partials/header.html`
- `src/partials/footer.html`

If files are missing or empty, nothing is rendered.

## Deployment

Works the same on all platforms:

1. Set env vars (`ADMIN_PASSWORD`, `TURSO_DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`, optional `TURSO_AUTH_TOKEN`)
2. `next build`
3. `next start`
