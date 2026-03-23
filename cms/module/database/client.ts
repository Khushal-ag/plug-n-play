import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";

import { cmsAdminBasePath } from "../config";
import * as schema from "./schema";

const defaultDbPath = "./data/cms.sqlite";

type SqliteDatabase = InstanceType<typeof Database>;

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as {
  __cms_sqlite?: SqliteDatabase;
  __cms_drizzle?: DrizzleDb;
};

function resolveDbPath(): string {
  const relative = process.env.CMS_DB_PATH ?? defaultDbPath;
  return path.resolve(/* turbopackIgnore: true */ process.cwd(), relative);
}

function migratePageAssetsColumn(sqlite: SqliteDatabase): void {
  const cols = sqlite.prepare("PRAGMA table_info(pages)").all() as {
    name: string;
  }[];
  if (cols.some((c) => c.name === "page_assets")) return;
  sqlite.exec(
    `ALTER TABLE pages ADD COLUMN page_assets TEXT NOT NULL DEFAULT '{}';`,
  );
}

function ensureSchema(sqlite: SqliteDatabase): void {
  sqlite.exec(`
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

  migratePageAssetsColumn(sqlite);

  sqlite.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS pages_slug_unique ON pages (slug);
  `);

  sqlite.exec(`
    CREATE TRIGGER IF NOT EXISTS pages_updated_at
    AFTER UPDATE ON pages
    BEGIN
      UPDATE pages SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;
  `);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS site_assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      content TEXT NOT NULL,
      updated_at TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL
    );
  `);

  sqlite.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS site_assets_filename_unique ON site_assets (filename);
  `);
}

function seedHomeIfMissing(sqlite: SqliteDatabase): void {
  const db = drizzle(sqlite, { schema });
  const existing = db
    .select({ id: schema.pages.id })
    .from(schema.pages)
    .where(eq(schema.pages.slug, "home"))
    .get();
  if (existing) return;

  db.insert(schema.pages)
    .values({
      slug: "home",
      title: "Home",
      html: `<main style="min-height:80vh;display:flex;flex-direction:column;justify-content:center;align-items:center;background:linear-gradient(180deg,#f8fafc 0%,#e2e8f0 100%);color:#0f172a;font-family:system-ui,-apple-system,sans-serif;padding:2rem;text-align:center;box-sizing:border-box">
  <p style="letter-spacing:0.2em;text-transform:uppercase;font-size:0.7rem;color:#64748b;margin:0 0 1rem">Content management</p>
  <h1 style="font-size:clamp(1.75rem,5vw,3rem);font-weight:700;margin:0 0 1rem;color:#0f172a">Your site starts here</h1>
  <p style="max-width:28rem;margin:0;color:#475569;line-height:1.7;font-size:1rem">Edit this page in the studio. Paste full HTML, add layouts, and use <strong>Preview</strong> while you work.</p>
  <a href="${cmsAdminBasePath}" style="margin-top:2rem;display:inline-flex;padding:0.75rem 1.5rem;border-radius:0.5rem;background:#0f172a;color:#fff;text-decoration:none;font-weight:600;font-size:0.9rem">Open studio</a>
</main>`,
      metaDescription: "Welcome — edit in the CMS studio.",
      metaKeywords: "home, cms",
      isPublished: 1,
    })
    .run();
}

function getSqlite(): SqliteDatabase {
  if (globalForDb.__cms_sqlite) {
    return globalForDb.__cms_sqlite;
  }

  const absolute = resolveDbPath();
  fs.mkdirSync(path.dirname(absolute), { recursive: true });

  const sqlite = new Database(absolute);
  sqlite.pragma("journal_mode = WAL");
  ensureSchema(sqlite);
  seedHomeIfMissing(sqlite);

  globalForDb.__cms_sqlite = sqlite;
  return sqlite;
}

export function getDrizzle(): DrizzleDb {
  if (globalForDb.__cms_drizzle) {
    return globalForDb.__cms_drizzle;
  }

  const sqlite = getSqlite();
  const db = drizzle(sqlite, { schema });
  globalForDb.__cms_drizzle = db;
  return db;
}

/**
 * Run synchronous work in one SQLite transaction on the shared CMS connection
 * (rolls back if `fn` throws).
 */
export function withSqliteTransaction<T>(fn: () => T): T {
  const sqlite = getSqlite();
  return sqlite.transaction(fn)();
}

export { schema };
