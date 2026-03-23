# CMS template

Reusable CMS for **Next.js App Router**.

## Copy to another project

1. Copy the **`cms/`** folder into your project root.
2. Run:

```bash
node cms/install.mjs
```

3. Set env in `.env.local`:

- `ADMIN_PASSWORD`
- `CMS_DB_PATH` (optional, default `./data/cms.sqlite`)
- `NEXT_PUBLIC_SITE_URL`

4. Ensure `next.config` has:

```ts
serverExternalPackages: ["better-sqlite3"];
```

5. Run:

```bash
bun run db:push
bun run dev
```

- Admin: `http://localhost:3000/admin`

## How it works

- CMS code stays in **`cms/module`**.
- Installer copies route entry files to **`src/app`**.
- `@cms/*` points to **`./cms/module/*`**.

## Scripts (this repo)

- `bun run cms:sync` — sync `cms/routes/app` to `src/app`
- `bun run validate` — lint + typecheck + build
- `bun run db:push` — apply DB schema
