import { getDrizzle } from "@cms/database/client";
import { pages } from "@cms/database/schema";
import { serializePageAssets } from "@cms/lib/page-assets";
import { and, desc, eq } from "drizzle-orm";

import type { PageSelect } from "@cms/database/schema";

export type PageRow = {
  id: number;
  slug: string;
  title: string;
  html: string;
  /** JSON string: `{ "style.css": "..." }` */
  page_assets: string;
  meta_description: string;
  meta_keywords: string;
  is_published: number;
  created_at: string;
  updated_at: string;
};

export type PageInput = {
  slug: string;
  title: string;
  html: string;
  metaDescription: string;
  metaKeywords: string;
  isPublished: boolean;
  /** Sanitized filename -> file body */
  pageAssets: Record<string, string>;
};

function mapPage(row: PageSelect): PageRow {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    html: row.html,
    page_assets: row.pageAssets ?? "{}",
    meta_description: row.metaDescription,
    meta_keywords: row.metaKeywords,
    is_published: row.isPublished,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

export async function listPages(): Promise<PageRow[]> {
  const db = getDrizzle();
  const rows = db.select().from(pages).orderBy(desc(pages.updatedAt)).all();
  return rows.map(mapPage);
}

export async function listPublishedForSitemap(): Promise<
  Pick<PageRow, "slug" | "updated_at">[]
> {
  const db = getDrizzle();
  const rows = db
    .select({ slug: pages.slug, updated_at: pages.updatedAt })
    .from(pages)
    .where(eq(pages.isPublished, 1))
    .orderBy(pages.slug)
    .all();
  return rows.map((r) => ({
    slug: r.slug,
    updated_at: r.updated_at,
  }));
}

export async function getPageById(id: number): Promise<PageRow | undefined> {
  const db = getDrizzle();
  const row = db.select().from(pages).where(eq(pages.id, id)).get();
  return row ? mapPage(row) : undefined;
}

export async function getPageBySlug(
  slug: string,
): Promise<PageRow | undefined> {
  const db = getDrizzle();
  const row = db
    .select()
    .from(pages)
    .where(and(eq(pages.slug, slug), eq(pages.isPublished, 1)))
    .get();
  return row ? mapPage(row) : undefined;
}

export async function createPage(input: PageInput): Promise<void> {
  const db = getDrizzle();
  db.insert(pages)
    .values({
      slug: input.slug,
      title: input.title,
      html: input.html,
      pageAssets: serializePageAssets(input.pageAssets),
      metaDescription: input.metaDescription,
      metaKeywords: input.metaKeywords,
      isPublished: input.isPublished ? 1 : 0,
    })
    .run();
}

export async function updatePage(id: number, input: PageInput): Promise<void> {
  const db = getDrizzle();
  db.update(pages)
    .set({
      slug: input.slug,
      title: input.title,
      html: input.html,
      pageAssets: serializePageAssets(input.pageAssets),
      metaDescription: input.metaDescription,
      metaKeywords: input.metaKeywords,
      isPublished: input.isPublished ? 1 : 0,
    })
    .where(eq(pages.id, id))
    .run();
}

export async function deletePage(id: number): Promise<void> {
  const db = getDrizzle();
  db.delete(pages).where(eq(pages.id, id)).run();
}
