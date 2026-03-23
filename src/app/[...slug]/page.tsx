import { notFound } from "next/navigation";

import { cmsDefaultMetaDescription, cmsSiteUrl } from "@cms/config";
import { getPageBySlug } from "@cms/data/pages";

type Props = {
  params: Promise<{ slug: string[] }>;
};

function toPathSlug(segments: string[] | undefined): string {
  if (!segments?.length) return "home";
  return segments.join("/").toLowerCase();
}

export async function generateMetadata({ params }: Props) {
  const resolved = await params;
  const slug = toPathSlug(resolved.slug);
  const page = await getPageBySlug(slug);
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

export default async function CmsSlugPage({ params }: Props) {
  const resolved = await params;
  const slug = toPathSlug(resolved.slug);
  const page = await getPageBySlug(slug);

  if (!page) notFound();

  return (
    <main
      className="min-h-screen bg-white"
      dangerouslySetInnerHTML={{ __html: page.html }}
    />
  );
}
