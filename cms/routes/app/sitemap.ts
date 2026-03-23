import { cmsSiteUrl } from "@cms/config";
import { listPublishedForSitemap } from "@cms/data/pages";

import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = cmsSiteUrl;
  const rows = await listPublishedForSitemap();

  const entries: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  for (const row of rows) {
    if (row.slug === "home") continue;
    entries.push({
      url: `${base}/${row.slug}`,
      lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  return entries;
}
