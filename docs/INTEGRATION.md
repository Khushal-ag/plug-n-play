# CMS integration

Embedding the **`cms/`** tree into an existing Next.js (App Router) app.

## Prerequisites

Node **≥ 20.9** (see host `package.json` `engines`), TypeScript, App Router. Examples use `bun`; use your package manager as needed.

## Steps

1. Copy **`cms/`** to the project root.
2. From the project root: **`node cms/install.mjs`**  
   Flags: **`--dry-run`** (print only), **`--skip-install`** (no dependency install), **`--no-public-routes`** (admin routes only — no public pages/sitemap copy).
3. **`.env.local`** (see also `.env.example` the installer may append):

| Variable                              | Required | Notes                                                                                                              |
| ------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `ADMIN_PASSWORD`                      | yes      | Admin login                                                                                                        |
| `NEXT_PUBLIC_SITE_URL`                | yes      | Canonical URL (metadata, sitemap)                                                                                  |
| `CMS_DB_PATH`                         | no       | Default `./data/cms.sqlite`                                                                                        |
| `NEXT_PUBLIC_CMS_ADMIN_BASE`          | no       | Default `/admin`                                                                                                   |
| `NEXT_PUBLIC_CMS_BRAND_NAME`          | no       | Admin title                                                                                                        |
| `NEXT_PUBLIC_CMS_BRAND_TAGLINE`       | no       | Admin subtitle                                                                                                     |
| `NEXT_PUBLIC_CMS_DEFAULT_DESCRIPTION` | no       | Fallback meta description                                                                                          |
| `NEXT_PUBLIC_IMAGE_HOSTS`             | no       | Comma-separated hostnames; enables `next/image` remote patterns in host `next.config` if merged from this template |

4. Merge into **`next.config`**: **`serverExternalPackages: ["better-sqlite3"]`**. For large HTML/asset payloads, set **`experimental.serverActions.bodySizeLimit`** (this template uses **`"32mb"`**).
5. Apply DB schema (**`drizzle-kit push`** / your project’s **`db:push`** script), then start the app.

When you maintain routes inside **`cms/routes/app`**, run **`node cms/sync-routes.mjs`** (or **`bun run cms:sync`**) so **`src/app`** stays updated.

## What `install.mjs` does

- Leaves CMS source under **`cms/module`**
- Copies **`cms/routes/app`** → **`src/app`** (skips public routes if **`--no-public-routes`**)
- Adds **`@cms/*` → `./cms/module/*`** in **`tsconfig.json`** if missing
- Adds **`drizzle.config.ts`** if missing
- Appends CMS env keys to **`.env.example`** if missing
- Installs packages from **`cms/deps.json`** unless **`--skip-install`**

## Page assets

In the page editor, **Page assets**: upload files whose **names** match **`href` / `src`** (basename only, e.g. `logo.png` for `assets/logo.png`). Served from **`/cms-assets/{slug}/…`**.

Limits and rules are defined in **`cms/module/lib/page-assets.ts`** (e.g. **`PAGE_ASSETS_MAX_BYTES`** per page, allowed extensions, raster images as data URLs in SQLite).

## Site-wide assets

**Admin → Site assets** (`/admin/dashboard/site-assets`): shared library at **`/cms-global-assets/{filename}`**. Same basename on a **page** overrides the site file for that page. **`SITE_ASSETS_MAX_TOTAL_BYTES`** and CSS **`url(...)`** rewriting are handled in **`page-assets.ts`** and the asset routes.

## HTML on the public site

- Full HTML documents are normalized for injection into the app shell (**`cms/module/lib/cms-html.ts`**).
- **`about.html` / `index.html`-style links** are rewritten to routes when slugs match (**`cms/module/lib/cms-page-links.ts`**).

## Git

Use **`/data/`** in **`.gitignore`** (repo root only) for the SQLite directory. A rule **`data/`** without a leading slash ignores **every** `data` folder, including **`cms/module/data/`** (TypeScript — must be committed).
