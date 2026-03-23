/**
 * Portable CMS — env-driven admin path, branding, and public URL helpers.
 * Host apps keep CMS code in `cms/module` (wired by `cms/install.mjs`).
 */
const raw = process.env.NEXT_PUBLIC_CMS_ADMIN_BASE ?? "/admin";

/** Normalized admin URL prefix (no trailing slash). Default `/admin`. */
export const cmsAdminBasePath = raw.replace(/\/$/, "") || "/admin";

/** Canonical site URL for sitemap / metadata (no trailing slash). */
export const cmsSiteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

/** Admin UI + login title (no dependency on host `siteConfig`). */
export const cmsBrandName =
  process.env.NEXT_PUBLIC_CMS_BRAND_NAME ?? "Content Studio";

export const cmsBrandTagline =
  process.env.NEXT_PUBLIC_CMS_BRAND_TAGLINE ?? "Content studio";

/** Fallback when a page has no meta description. */
export const cmsDefaultMetaDescription =
  process.env.NEXT_PUBLIC_CMS_DEFAULT_DESCRIPTION ?? "";

export const cmsConfig = {
  adminBasePath: cmsAdminBasePath,
  cookieName: "cms_admin_session" as const,
  /** SQLite file path env key */
  dbPathEnv: "CMS_DB_PATH",
  /** Admin password env key */
  adminPasswordEnv: "ADMIN_PASSWORD",
} as const;
