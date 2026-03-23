import { cache } from "react";

import { getDrizzle } from "@cms/database/client";
import { siteAssets } from "@cms/database/schema";
import {
  parsePageAssetsJson,
  sanitizeAssetFilename,
  serializePageAssets,
} from "@cms/lib/page-assets";

export async function getSiteAssetsMap(): Promise<Record<string, string>> {
  const db = getDrizzle();
  const rows = db.select().from(siteAssets).all();
  const out: Record<string, string> = {};
  for (const row of rows) {
    const safe = sanitizeAssetFilename(row.filename);
    if (safe) out[safe] = row.content;
  }
  return out;
}

/** One DB read per request when called from multiple RSCs/routes in the same render. */
export const getSiteAssetFilenames = cache(async (): Promise<string[]> => {
  const db = getDrizzle();
  const rows = db
    .select({ filename: siteAssets.filename })
    .from(siteAssets)
    .all();
  const names: string[] = [];
  for (const r of rows) {
    const safe = sanitizeAssetFilename(r.filename);
    if (safe) names.push(safe);
  }
  return names;
});

/**
 * Replace the entire site library (form save).
 */
export async function replaceSiteAssets(
  assets: Record<string, string>,
): Promise<void> {
  const db = getDrizzle();
  const json = serializePageAssets(assets);
  const cleaned = parsePageAssetsJson(json);
  db.delete(siteAssets).run();
  for (const [filename, content] of Object.entries(cleaned)) {
    db.insert(siteAssets).values({ filename, content }).run();
  }
}
