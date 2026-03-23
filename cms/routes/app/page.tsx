import { notFound } from "next/navigation";

import { cmsDefaultMetaDescription, cmsSiteUrl } from "@cms/config";
import { getPageBySlug } from "@cms/data/pages";

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

  return (
    <main
      className="min-h-screen bg-white"
      dangerouslySetInnerHTML={{ __html: page.html }}
    />
  );
}
