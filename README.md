# CMS template

Next.js **App Router** CMS: SQLite, HTML pages, admin. Code in **`cms/module`**; route entry files in **`cms/routes/app`** (synced into **`src/app`**).

## This repository

1. `bun install`
2. Copy `.env.example` → `.env.local` and set **`ADMIN_PASSWORD`** (and URLs if not local).
3. `bun run db:push`
4. `bun run dev` → sign in at **`/admin`** (or `NEXT_PUBLIC_CMS_ADMIN_BASE`).

After editing anything under **`cms/routes/app`**, run **`bun run cms:sync`** so `src/app` stays in sync.

**Admin hydration warning in dev:** With Turbopack, the server bundle can briefly lag behind the client after many UI edits, which triggers React hydration warnings. The admin sidebar and page editor load **client-only** to avoid that drift. If you still see mismatches elsewhere, run **`bun run dev:fresh`** (clears `.next`) or try **`bun run dev:webpack`** (no Turbopack).

**Layout:** The default public layout can load **`src/partials/header.html`** and **`footer.html`** (install may create them). You can change or drop that pattern—CMS page HTML is whatever you store per page (snippet or full page), depending on your layout.

## Another project

Copy the **`cms/`** folder into the project root, run **`node cms/install.mjs`**, then follow **`cms/README.md`** (full embed guide — it lives inside **`cms/`**).

## `next.config`

- `serverExternalPackages: ["better-sqlite3"]`
- For large page/site asset saves: `experimental.serverActions.bodySizeLimit` (this repo uses `"32mb"`)

## Scripts

| Command               | Purpose                                      |
| --------------------- | -------------------------------------------- |
| `bun run cms:sync`    | `cms/routes/app` → `src/app`                 |
| `bun run cms:install` | Run `cms/install.mjs`                        |
| `bun run db:push`     | Apply Drizzle schema to SQLite               |
| `bun run dev:fresh`   | Clear `.next` then `next dev --turbopack`    |
| `bun run dev:webpack` | `next dev` without Turbopack                 |
| `bun run validate`    | ESLint + TypeScript + Prettier check + build |

Embed another app: **`cms/README.md`**.
