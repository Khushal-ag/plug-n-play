"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@cms/auth/session";
import { cmsAdminBasePath } from "@cms/config";
import { createPage, deletePage, updatePage } from "@cms/data/pages";
import {
  PAGE_ASSETS_MAX_BYTES,
  pageAssetsJsonByteLength,
  parsePageAssetsJson,
  serializePageAssets,
} from "@cms/lib/page-assets";

import type { PageInput } from "@cms/data/pages";

function normalizeSlug(raw: FormDataEntryValue | null): string {
  return String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "")
    .replace(/\s+/g, "-");
}

function normalizePayload(formData: FormData): PageInput {
  const serialized = serializePageAssets(
    parsePageAssetsJson(String(formData.get("pageAssets") ?? "{}")),
  );
  if (pageAssetsJsonByteLength(serialized) > PAGE_ASSETS_MAX_BYTES) {
    throw new Error(
      "Page assets are too large (max 2 MB total). Remove a file or shorten content.",
    );
  }

  return {
    slug: normalizeSlug(formData.get("slug")),
    title: String(formData.get("title") ?? "").trim(),
    html: String(formData.get("html") ?? ""),
    metaDescription: String(formData.get("metaDescription") ?? "").trim(),
    metaKeywords: String(formData.get("metaKeywords") ?? "").trim(),
    isPublished: formData.get("isPublished") === "on",
    pageAssets: parsePageAssetsJson(serialized),
  };
}

function validate(payload: PageInput): void {
  if (!payload.slug) {
    throw new Error("Slug is required.");
  }
  if (payload.slug === "admin") {
    throw new Error("Slug 'admin' is reserved.");
  }
  if (!payload.title) {
    throw new Error("Title is required.");
  }
  if (!payload.html) {
    throw new Error("HTML content is required.");
  }
}

export async function createPageAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const payload = normalizePayload(formData);
  validate(payload);

  await createPage(payload);
  revalidatePath("/");
  revalidatePath(`${cmsAdminBasePath}/dashboard`);
  redirect(`${cmsAdminBasePath}/dashboard`);
}

export async function updatePageAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) {
    throw new Error("Invalid page id.");
  }

  const payload = normalizePayload(formData);
  validate(payload);

  await updatePage(id, payload);
  revalidatePath("/");
  revalidatePath(`${cmsAdminBasePath}/dashboard`);
  redirect(`${cmsAdminBasePath}/dashboard`);
}

export async function deletePageAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) {
    throw new Error("Invalid page id.");
  }

  await deletePage(id);
  revalidatePath("/");
  revalidatePath(`${cmsAdminBasePath}/dashboard`);
  redirect(`${cmsAdminBasePath}/dashboard`);
}
