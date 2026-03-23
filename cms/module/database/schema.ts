import { sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

/** Named unique index matches `drizzle-kit push` introspection. */
export const pages = sqliteTable(
  "pages",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    html: text("html").notNull(),
    metaDescription: text("meta_description").notNull().default(""),
    metaKeywords: text("meta_keywords").notNull().default(""),
    /** JSON map of filename -> file contents for CSS/JS linked from HTML */
    pageAssets: text("page_assets").notNull().default("{}"),
    isPublished: integer("is_published", { mode: "number" })
      .notNull()
      .default(1),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [uniqueIndex("pages_slug_unique").on(table.slug)],
);

export type PageSelect = typeof pages.$inferSelect;
export type PageInsert = typeof pages.$inferInsert;

/** Shared CSS/JS/images for all pages (unique filename). */
export const siteAssets = sqliteTable(
  "site_assets",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    filename: text("filename").notNull(),
    content: text("content").notNull(),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [uniqueIndex("site_assets_filename_unique").on(table.filename)],
);

export type SiteAssetSelect = typeof siteAssets.$inferSelect;
