"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@cms/auth/session";
import { cmsAdminBasePath } from "@cms/config";
import { replaceSiteAssets } from "@cms/data/site-assets";
import {
  pageAssetsJsonByteLength,
  parsePageAssetsJson,
  serializePageAssets,
  SITE_ASSETS_MAX_TOTAL_BYTES,
} from "@cms/lib/page-assets";

const siteAssetsHref = `${cmsAdminBasePath}/dashboard/site-assets`;

export type SiteAssetsFormState = {
  error?: string;
};

export async function replaceSiteAssetsAction(
  _prev: SiteAssetsFormState,
  formData: FormData,
): Promise<SiteAssetsFormState> {
  await requireAdmin();
  const raw = String(formData.get("siteAssets") ?? "{}");

  try {
    const parsed = parsePageAssetsJson(raw);
    const serialized = serializePageAssets(parsed);
    if (pageAssetsJsonByteLength(serialized) > SITE_ASSETS_MAX_TOTAL_BYTES) {
      return {
        error: `Site-wide assets are too large (max ${Math.round(SITE_ASSETS_MAX_TOTAL_BYTES / (1024 * 1024))} MB total). Compress images or remove some files.`,
      };
    }
    await replaceSiteAssets(parsePageAssetsJson(serialized));
  } catch (e) {
    const message =
      e instanceof Error ?
        e.message
      : "Could not save. If the library is very large, try saving in smaller batches.";
    return { error: message };
  }

  revalidatePath("/");
  redirect(siteAssetsHref);
}
