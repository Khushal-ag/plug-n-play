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
