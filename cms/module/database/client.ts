import { createClient } from "@libsql/client";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";

import { cmsAdminBasePath } from "../config";
import * as schema from "./schema";

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as {
  __cms_libsql?: ReturnType<typeof createClient>;
  __cms_drizzle?: DrizzleDb;
  __cms_bootstrap?: Promise<void>;
};

function resolveDbConfig(): { url: string; authToken?: string } {
  const url = process.env.TURSO_DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "Missing TURSO_DATABASE_URL. Configure Turso/libSQL first.",
    );
  }
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim() || undefined;
  return { url, authToken };
}

async function migratePageAssetsColumn(
  client: ReturnType<typeof createClient>,
): Promise<void> {
  const cols = await client.execute("PRAGMA table_info(pages)");
  const hasPageAssets = cols.rows.some((row) => row.name === "page_assets");
  if (hasPageAssets) return;
  await client.execute(
    `ALTER TABLE pages ADD COLUMN page_assets TEXT NOT NULL DEFAULT '{}';`,
  );
}

async function ensureSchema(
  client: ReturnType<typeof createClient>,
): Promise<void> {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL,
      title TEXT NOT NULL,
      html TEXT NOT NULL,
      meta_description TEXT DEFAULT '' NOT NULL,
      meta_keywords TEXT DEFAULT '' NOT NULL,
      page_assets TEXT DEFAULT '{}' NOT NULL,
      is_published INTEGER DEFAULT 1 NOT NULL,
      created_at TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
      updated_at TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL
    );
  `);

  await migratePageAssetsColumn(client);

  await client.execute(`
    CREATE UNIQUE INDEX IF NOT EXISTS pages_slug_unique ON pages (slug);
  `);

  await client.execute(`
    CREATE TRIGGER IF NOT EXISTS pages_updated_at
    AFTER UPDATE ON pages
    BEGIN
      UPDATE pages SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS site_assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      content TEXT NOT NULL,
      updated_at TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL
    );
  `);

  await client.execute(`
    CREATE UNIQUE INDEX IF NOT EXISTS site_assets_filename_unique ON site_assets (filename);
  `);
}

async function seedHomeIfMissing(db: DrizzleDb): Promise<void> {
  const existingRows = await db
    .select({ id: schema.pages.id })
    .from(schema.pages)
    .where(eq(schema.pages.slug, "home"))
    .limit(1);
  if (existingRows.length > 0) return;

  await db
    .insert(schema.pages)
    .values({
      slug: "home",
      title: "Home",
      html: `<main style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem;background:radial-gradient(1200px 600px at 20% -10%,#dbeafe 0%,transparent 60%),radial-gradient(1000px 500px at 120% 120%,#dcfce7 0%,transparent 60%),linear-gradient(180deg,#f8fafc 0%,#eef2ff 100%);font-family:Inter,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#0f172a;box-sizing:border-box">
  <section style="width:min(56rem,100%);background:rgba(255,255,255,0.88);backdrop-filter:blur(6px);border:1px solid #e2e8f0;border-radius:1rem;padding:clamp(1.25rem,2.5vw,2rem);box-shadow:0 12px 30px rgba(2,6,23,0.08)">
    <p style="display:inline-flex;align-items:center;gap:0.45rem;margin:0;padding:0.35rem 0.65rem;border-radius:999px;background:#eff6ff;color:#1d4ed8;font-size:0.72rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase">CMS Ready</p>
    <h1 style="margin:0.95rem 0 0.7rem;font-size:clamp(1.6rem,4vw,2.7rem);line-height:1.15;letter-spacing:-0.02em">Your new site is live.</h1>
    <p style="margin:0;max-width:42rem;color:#475569;font-size:1.02rem;line-height:1.7">This is the default home page created by the CMS. Sign in to the admin panel to replace this content, create additional pages, and publish updates instantly.</p>
    <div style="display:flex;flex-wrap:wrap;gap:0.75rem;margin-top:1.4rem">
      <a href="${cmsAdminBasePath}" style="display:inline-flex;align-items:center;justify-content:center;padding:0.72rem 1.1rem;border-radius:0.65rem;background:#0f172a;color:#fff;text-decoration:none;font-weight:600;font-size:0.92rem">Open Admin</a>
      <a href="${cmsAdminBasePath}/dashboard/new" style="display:inline-flex;align-items:center;justify-content:center;padding:0.72rem 1.1rem;border-radius:0.65rem;border:1px solid #cbd5e1;background:#fff;color:#0f172a;text-decoration:none;font-weight:600;font-size:0.92rem">Create First Page</a>
    </div>
    <ul style="margin:1.25rem 0 0;padding:0;list-style:none;display:grid;gap:0.55rem;color:#334155;font-size:0.93rem">
      <li>• Add SEO title, description, and keywords per page.</li>
      <li>• Upload page-level and shared site assets.</li>
      <li>• Keep drafts unpublished until you are ready.</li>
    </ul>
  </section>
</main>`,
      metaDescription:
        "Default CMS home page. Open admin to publish your content.",
      metaKeywords: "cms, home, starter",
      isPublished: 1,
    })
    .execute();
}

function getLibsqlClient(): ReturnType<typeof createClient> {
  if (globalForDb.__cms_libsql) {
    return globalForDb.__cms_libsql;
  }

  const cfg = resolveDbConfig();
  const client = createClient({
    url: cfg.url,
    authToken: cfg.authToken,
  });
  globalForDb.__cms_libsql = client;
  return client;
}

async function ensureBootstrapped(db: DrizzleDb): Promise<void> {
  if (!globalForDb.__cms_bootstrap) {
    const client = getLibsqlClient();
    globalForDb.__cms_bootstrap = (async () => {
      await ensureSchema(client);
      await seedHomeIfMissing(db);
    })();
  }
  await globalForDb.__cms_bootstrap;
}

export async function getDrizzle(): Promise<DrizzleDb> {
  if (globalForDb.__cms_drizzle) {
    await ensureBootstrapped(globalForDb.__cms_drizzle);
    return globalForDb.__cms_drizzle;
  }

  const client = getLibsqlClient();
  const db = drizzle(client, { schema });
  globalForDb.__cms_drizzle = db;
  await ensureBootstrapped(db);
  return db;
}

export { schema };
