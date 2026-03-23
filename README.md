# CMS template

Next.js **App Router** CMS: SQLite, HTML pages, admin. Code in **`cms/module`**; route entry files in **`cms/routes/app`** (synced into **`src/app`**).

## This repository

1. `bun install`
2. Copy `.env.example` → `.env.local` and set **`ADMIN_PASSWORD`** (and URLs if not local).
3. `bun run db:push`
4. `bun run dev` → sign in at **`/admin`** (or `NEXT_PUBLIC_CMS_ADMIN_BASE`).

After editing anything under **`cms/routes/app`**, run **`bun run cms:sync`** so `src/app` stays in sync.

## Another project

Copy the **`cms/`** folder into the project root, run **`node cms/install.mjs`**, then follow **`docs/INTEGRATION.md`**.

## `next.config`

- `serverExternalPackages: ["better-sqlite3"]`
- For large page/site asset saves: `experimental.serverActions.bodySizeLimit` (this repo uses `"32mb"`)

## Scripts

| Command               | Purpose                                      |
| --------------------- | -------------------------------------------- |
| `bun run cms:sync`    | `cms/routes/app` → `src/app`                 |
| `bun run cms:install` | Run `cms/install.mjs`                        |
| `bun run db:push`     | Apply Drizzle schema to SQLite               |
| `bun run validate`    | ESLint + TypeScript + Prettier check + build |

Full env options and asset behavior: **`docs/INTEGRATION.md`**.
