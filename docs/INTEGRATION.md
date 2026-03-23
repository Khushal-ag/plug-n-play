# CMS integration

## Required stack

- Next.js (App Router)
- React + TypeScript
- Node runtime (for server actions)

## Install (minimal)

1. Copy **`cms/`** into your project root.
2. Run from project root:

```bash
node cms/install.mjs
```

3. Set `.env.local`:

- `ADMIN_PASSWORD`
- `CMS_DB_PATH` (optional)
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_CMS_ADMIN_BASE` (optional, default `/admin`)
- `NEXT_PUBLIC_CMS_BRAND_NAME` (optional)
- `NEXT_PUBLIC_CMS_BRAND_TAGLINE` (optional)
- `NEXT_PUBLIC_CMS_DEFAULT_DESCRIPTION` (optional)

4. Merge in `next.config`:

```ts
serverExternalPackages: ["better-sqlite3"];
```

5. Apply schema and start:

```bash
bun run db:push
bun run dev
```

Open `/admin` and create pages.

## What installer does

- keeps CMS source in `cms/module`
- copies route files from `cms/routes/app` to `src/app`
- adds `@cms/* -> ./cms/module/*` in `tsconfig` (if missing)
- creates `drizzle.config.ts` (if missing)
- appends CMS env keys to `.env.example` (if missing)
- installs packages from `cms/deps.json`

## Flags

- `--dry-run`
- `--skip-install`
- `--no-public-routes` (admin routes only)

## Keep folders separate

Keep **`cms/`** in the project. Your site code remains in **`src/`**.
