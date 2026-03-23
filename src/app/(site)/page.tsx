import { notFound } from "next/navigation";

import { cmsDefaultMetaDescription, cmsSiteUrl } from "@cms/config";
import { getPageBySlug } from "@cms/data/pages";
import { getSiteAssetFilenames } from "@cms/data/site-assets";
import { normalizeHtmlForMainInjection } from "@cms/lib/cms-html";
import { rewriteHtmlFileLinksToSlugs } from "@cms/lib/cms-page-links";
import {
  parsePageAssetsJson,
  rewriteHtmlAssetRefs,
} from "@cms/lib/page-assets";

export async function generateMetadata() {
  const page = await getPageBySlug("home");
  if (!page) {
    return { title: "Page Not Found" };
  }

  return {
    metadataBase: new URL(cmsSiteUrl),
    title: page.title,
    description:
      page.meta_description || cmsDefaultMetaDescription || undefined,
    keywords: page.meta_keywords ? page.meta_keywords.split(",") : undefined,
  };
}

export default async function HomePage() {
  const page = await getPageBySlug("home");
  if (!page) notFound();

  const assets = parsePageAssetsJson(page.page_assets);
  const globalNames = await getSiteAssetFilenames();
  const normalized = normalizeHtmlForMainInjection(page.html);
  const withRoutes = rewriteHtmlFileLinksToSlugs(normalized, page.slug);
  const html = rewriteHtmlAssetRefs(
    withRoutes,
    page.slug,
    Object.keys(assets),
    globalNames,
  );

  return (
    <main
      className="w-full flex-1 bg-white"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
