import { Buffer } from "node:buffer";
import { NextResponse } from "next/server";

import { getSiteAssetFilenames } from "@cms/data/site-assets";
import { getDrizzle } from "@cms/database/client";
import { siteAssets } from "@cms/database/schema";
import {
  contentTypeForAssetFilename,
  decodeDataUrlBody,
} from "@cms/lib/asset-response";
import {
  rewriteCssAssetRefs,
  rewriteCssUnresolvedAssetUrls,
  sanitizeAssetFilename,
} from "@cms/lib/page-assets";
import { eq } from "drizzle-orm";

type RouteContext = {
  params: Promise<{ filename: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { filename: raw } = await context.params;
  const decoded = decodeURIComponent(raw ?? "");
  const safe = sanitizeAssetFilename(decoded);
  if (!safe) {
    return new NextResponse("Not found", { status: 404 });
  }

  const db = await getDrizzle();
  const rows = await db
    .select()
    .from(siteAssets)
    .where(eq(siteAssets.filename, safe))
    .limit(1);
  const row = rows[0];

  if (!row) {
    return new NextResponse("Not found", { status: 404 });
  }

  const decodedBody = decodeDataUrlBody(row.content);
  if (decodedBody) {
    return new NextResponse(Buffer.from(decodedBody.bytes), {
      status: 200,
      headers: {
        "Content-Type": decodedBody.mime,
        "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
      },
    });
  }

  let payload = row.content;
  if (safe.toLowerCase().endsWith(".css")) {
    const globalNames = await getSiteAssetFilenames();
    payload = rewriteCssAssetRefs(payload, "", [], globalNames);
    payload = rewriteCssUnresolvedAssetUrls(payload, "", [], globalNames);
  }

  return new NextResponse(payload, {
    status: 200,
    headers: {
      "Content-Type": contentTypeForAssetFilename(row.filename),
      "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
    },
  });
}
