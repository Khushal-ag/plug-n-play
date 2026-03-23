import { Buffer } from "node:buffer";
import { NextResponse } from "next/server";

import { getPageBySlug } from "@cms/data/pages";
import { getSiteAssetFilenames } from "@cms/data/site-assets";
import {
  contentTypeForAssetFilename,
  decodeDataUrlBody,
} from "@cms/lib/asset-response";
import {
  parsePageAssetsJson,
  rewriteCssAssetRefs,
  rewriteCssUnresolvedAssetUrls,
  sanitizeAssetFilename,
} from "@cms/lib/page-assets";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { path } = await context.params;
  if (!path?.length) {
    return new NextResponse("Not found", { status: 404 });
  }

  const rawFile = path[path.length - 1] ?? "";
  const filename = sanitizeAssetFilename(decodeURIComponent(rawFile));
  if (!filename) {
    return new NextResponse("Not found", { status: 404 });
  }

  const slug = path
    .slice(0, -1)
    .map((segment) => decodeURIComponent(segment))
    .join("/");

  if (!slug) {
    return new NextResponse("Not found", { status: 404 });
  }

  const page = await getPageBySlug(slug);
  if (!page) {
    return new NextResponse("Not found", { status: 404 });
  }

  const assets = parsePageAssetsJson(page.page_assets);
  const body = assets[filename];
  if (body === undefined) {
    return new NextResponse("Not found", { status: 404 });
  }

  let payload = body;
  if (filename.toLowerCase().endsWith(".css") && !body.startsWith("data:")) {
    const globalNames = await getSiteAssetFilenames();
    payload = rewriteCssAssetRefs(body, slug, Object.keys(assets), globalNames);
    payload = rewriteCssUnresolvedAssetUrls(
      payload,
      slug,
      Object.keys(assets),
      globalNames,
    );
  }

  const decoded = decodeDataUrlBody(payload);
  if (decoded) {
    return new NextResponse(Buffer.from(decoded.bytes), {
      status: 200,
      headers: {
        "Content-Type": decoded.mime,
        "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
      },
    });
  }

  return new NextResponse(payload, {
    status: 200,
    headers: {
      "Content-Type": contentTypeForAssetFilename(filename),
      "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
    },
  });
}
