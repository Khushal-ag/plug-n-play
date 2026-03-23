# CMS bundle — embed in your Next.js app

This folder is **self-contained**: copy it into a Next.js **App Router** project that uses **`src/app`** (not a root-level `app/` folder only).

## Prerequisites

Node **≥ 20.9**, TypeScript, App Router with **`src/app`**. The installer targets **`src/app`**; root-only **`app/`** is not supported out of the box. Examples below use **`bun`**; use your package manager.

## Quick start

1. Copy **`cms/`** to the project root (next to **`package.json`**).
2. Run **`node cms/install.mjs`**
   - **`--dry-run`** — print actions only
   - **`--skip-install`** — do not install **`cms/deps.json`** packages
   - **`--no-public-routes`** — skips **`(site)`**, **`sitemap.ts`**, **`robots.ts`**; still copies **`admin/`**, **`cms-assets/`**, and **`cms-global-assets/`** so the admin UI works
3. Merge **`next.config`**: **`serverExternalPackages: ["better-sqlite3"]`**. For large HTML/asset saves, set **`experimental.serverActions.bodySizeLimit`** (e.g. **`"32mb"`**).
4. The installer adds **`@cms/*` → `./cms/module/*`** in **`tsconfig.json`** when it can patch **`paths`**.
5. Copy **`.env.example`** → **`.env.local`** and set at least **`ADMIN_PASSWORD`** and **`NEXT_PUBLIC_SITE_URL`** (see table below).
6. Run **`drizzle-kit push`** (or your **`db:push`** script) using **`drizzle.config.ts`**.
7. **`npm run dev`** / **`bun dev`** — open **`/admin`** (or **`NEXT_PUBLIC_CMS_ADMIN_BASE`**).

## Environment variables

| Variable                              | Required | Notes                                                                                                        |
| ------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------ |
| `ADMIN_PASSWORD`                      | yes      | Admin login                                                                                                  |
| `NEXT_PUBLIC_SITE_URL`                | yes      | Canonical URL (metadata, sitemap)                                                                            |
| `CMS_DB_PATH`                         | no       | Default **`./data/cms.sqlite`**                                                                              |
| `NEXT_PUBLIC_CMS_ADMIN_BASE`          | no       | Default **`/admin`**                                                                                         |
| `NEXT_PUBLIC_CMS_BRAND_NAME`          | no       | Admin title                                                                                                  |
| `NEXT_PUBLIC_CMS_BRAND_TAGLINE`       | no       | Admin subtitle                                                                                               |
| `NEXT_PUBLIC_CMS_DEFAULT_DESCRIPTION` | no       | Fallback meta description                                                                                    |
| `NEXT_PUBLIC_IMAGE_HOSTS`             | no       | Comma-separated hostnames; use with **`next/image`** remote patterns in the host **`next.config`** if needed |

## What `install.mjs` does

- Leaves CMS source under **`cms/module`**
- Copies **`cms/routes/app`** → **`src/app`** (includes **`robots.ts`** and **`sitemap.ts`** when public routes are included)
- Adds **`@cms/*` → `./cms/module/*`** in **`tsconfig.json`** if missing
- Adds **`drizzle.config.ts`** if missing
- Appends CMS env keys to **`.env.example`** if missing
- Creates **`src/partials/header.html`** and **`src/partials/footer.html`** from templates if missing (optional; see below)
- Installs packages from **`cms/deps.json`** unless **`--skip-install`**

## What stays in `cms/`

- **`module/`** — all CMS logic (import as **`@cms/...`**).
- **`routes/app/`** — route templates copied to **`src/app`**. In the **template repo**, run **`node cms/sync-routes.mjs`** after editing **`cms/routes/app`** so **`src/app`** stays in sync.

## What the host app must provide

- **`src/app/layout.tsx`** — root layout (fonts, **`globals.css`**, metadata, design tokens). The CMS does not ship a root layout—only **`(site)`**, **`admin`**, asset routes, **`sitemap.ts`**, and **`robots.ts`**.
- Tailwind / CSS so admin and public chrome look correct.

## Public page layout (optional partials)

The default **`(site)`** layout loads optional HTML fragments:

- **`src/partials/header.html`**
- **`src/partials/footer.html`**

You can ignore them, replace them, or put header/footer inside each page’s CMS HTML. To change behavior, edit **`cms/routes/app/(site)/layout.tsx`** (then sync to **`src/app`**).

| Approach                       | Typical setup                                                       |
| ------------------------------ | ------------------------------------------------------------------- |
| Shared chrome via files        | Keep partials; CMS field = middle content only                      |
| Header/footer inside each page | Adjust or remove the layout wrapper; CMS field = full HTML you need |
| Custom layout components       | Replace the layout’s **`dangerouslySetInnerHTML`** with your own UI |

If a partial file is missing, that slot renders nothing.

## Page assets

In the page editor, **Page assets**: upload files whose **names** match **`href` / `src`** (basename only, e.g. **`logo.png`** for **`assets/logo.png`**). Served from **`/cms-assets/{slug}/…`**.

Limits and rules: **`cms/module/lib/page-assets.ts`** (e.g. **`PAGE_ASSETS_MAX_BYTES`**, allowed extensions).

## Site-wide assets

**Admin → Site assets**: shared library at **`/cms-global-assets/{filename}`**. A **page** asset with the same basename overrides the site file for that page. Limits and CSS **`url(...)`** rewriting: **`page-assets.ts`** and the asset routes.

## HTML on the public site

- Full HTML documents are normalized for injection into the app shell (**`cms/module/lib/cms-html.ts`**).
- **`about.html` / `index.html`‑style links** are rewritten to routes when slugs match (**`cms/module/lib/cms-page-links.ts`**).

## Git

Ignore the SQLite directory at the repo root (e.g. **`/data/`** in **`.gitignore`**). Do **not** use a bare **`data/`** rule without a leading slash—it would ignore **`cms/module/data/`** (TypeScript — must stay committed).
