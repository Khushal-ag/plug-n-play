const rawUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const siteConfig = {
  name: "Plug and Play CMS",
  description:
    "Drop-in CMS: Turso-backed HTML pages, public routes by slug, admin at /admin.",
  url: rawUrl.replace(/\/$/, ""),
} as const;

export type SiteConfig = typeof siteConfig;
