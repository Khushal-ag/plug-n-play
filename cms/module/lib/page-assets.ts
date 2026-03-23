/** Max total serialized size for all page assets (bytes). */
export const PAGE_ASSETS_MAX_BYTES = 2 * 1024 * 1024;

/** Max total size for the site-wide shared asset library (bytes). */
export const SITE_ASSETS_MAX_TOTAL_BYTES = 25 * 1024 * 1024;

const ASSET_NAME_RE =
  /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.(css|js|png|jpe?g|gif|webp|svg|ico)$/i;

/** Basename must look like an image so we don't rewrite arbitrary relative URLs in CSS/HTML. */
const IMAGE_BASENAME_RE =
  /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.(png|jpe?g|gif|webp|svg|ico)$/i;

export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function sanitizeAssetFilename(name: string): string | null {
  const base = name.replace(/\\/g, "/").split("/").pop()?.trim() ?? "";
  if (!base || !ASSET_NAME_RE.test(base)) return null;
  return base;
}

export function parsePageAssetsJson(
  raw: string | null | undefined,
): Record<string, string> {
  if (!raw || raw === "{}") return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {};
    }
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      const name = sanitizeAssetFilename(k);
      if (!name || typeof v !== "string") continue;
      out[name] = v;
    }
    return out;
  } catch {
    return {};
  }
}

export function serializePageAssets(assets: Record<string, string>): string {
  const cleaned: Record<string, string> = {};
  for (const [k, v] of Object.entries(assets)) {
    const name = sanitizeAssetFilename(k);
    if (!name) continue;
    if (!v) continue;
    if (!v.trim() && !v.startsWith("data:")) continue;
    cleaned[name] = v;
  }
  return JSON.stringify(cleaned);
}

export function pageAssetsJsonByteLength(json: string): number {
  return new TextEncoder().encode(json).length;
}

/** Public URL path for a page asset (leading slash, no origin). */
export function pageAssetPublicPath(slug: string, filename: string): string {
  const safeName = sanitizeAssetFilename(filename);
  if (!safeName) return "";
  const parts = slug.split("/").filter(Boolean).map(encodeURIComponent);
  return `/cms-assets/${parts.join("/")}/${encodeURIComponent(safeName)}`;
}

/** Public URL for a site-wide shared asset (same file on every page). */
export function siteAssetPublicPath(filename: string): string {
  const safeName = sanitizeAssetFilename(filename);
  if (!safeName) return "";
  return `/cms-global-assets/${encodeURIComponent(safeName)}`;
}

function replaceRefsToFile(
  html: string,
  filename: string,
  replacement: string,
): string {
  const re = escapeRegExp(filename);
  return html.replace(
    new RegExp(
      `\\b(href|src)\\s*=\\s*(["'])(?:\\.\\.\\/)*(?:\\.\\/)*(?:[\\w.-]+\\/)*${re}\\2`,
      "gi",
    ),
    (_match, attr: string, quote: string) =>
      `${attr}=${quote}${replacement}${quote}`,
  );
}

/** CSS `url(img/foo.jpg)` / `url("foo.png")` → absolute CMS path (same path rules as href/src). */
export function replaceUrlRefsInCss(
  css: string,
  filename: string,
  replacement: string,
): string {
  const re = escapeRegExp(filename);
  return css.replace(
    new RegExp(
      `url\\(\\s*(["']?)(?:\\.\\.\\/)*(?:\\.\\/)*(?:[\\w.-]+\\/)*${re}\\1\\s*\\)`,
      "gi",
    ),
    (_m, quote: string) => {
      const q = quote === '"' || quote === "'" ? quote : "";
      const inner = q ? `${q}${replacement}${q}` : replacement;
      return `url(${inner})`;
    },
  );
}

/** Rewrite `url(...)` inside a CSS string (external stylesheet or inline). */
export function rewriteCssAssetRefs(
  css: string,
  slug: string,
  pageAssetFilenames: string[],
  globalAssetFilenames: string[] = [],
): string {
  const pageSet = new Set(
    pageAssetFilenames
      .map((n) => sanitizeAssetFilename(n))
      .filter((n): n is string => Boolean(n)),
  );
  let out = css;
  for (const name of pageAssetFilenames) {
    const safe = sanitizeAssetFilename(name);
    if (!safe) continue;
    const url = pageAssetPublicPath(slug, safe);
    if (!url) continue;
    out = replaceUrlRefsInCss(out, safe, url);
  }
  for (const name of globalAssetFilenames) {
    const safe = sanitizeAssetFilename(name);
    if (!safe || pageSet.has(safe)) continue;
    const url = siteAssetPublicPath(safe);
    if (!url) continue;
    out = replaceUrlRefsInCss(out, safe, url);
  }
  return out;
}

/**
 * Sanitized page-asset keys in stable order (deduped).
 */
function listSanitizedPageKeys(pageAssetFilenames: string[]): string[] {
  const seen = new Set<string>();
  const keys: string[] = [];
  for (const n of pageAssetFilenames) {
    const safe = sanitizeAssetFilename(n);
    if (safe && !seen.has(safe)) {
      seen.add(safe);
      keys.push(safe);
    }
  }
  return keys;
}

/**
 * Map lowercased image basenames → public CMS URL (page overrides global).
 * @param pageKeys Sanitized unique page filenames (see `listSanitizedPageKeys`).
 */
function buildAssetPublicUrlMap(
  slug: string,
  pageKeys: string[],
  globalAssetFilenames: string[] = [],
): Map<string, string> {
  const pageSet = new Set(pageKeys);
  const map = new Map<string, string>();
  for (const name of globalAssetFilenames) {
    const safe = sanitizeAssetFilename(name);
    if (!safe || pageSet.has(safe)) continue;
    const url = siteAssetPublicPath(safe);
    if (url) map.set(safe.toLowerCase(), url);
  }
  for (const safe of pageKeys) {
    const url = pageAssetPublicPath(slug, safe);
    if (url) map.set(safe.toLowerCase(), url);
  }
  return map;
}

function imageBasenameFromPath(inner: string): string | null {
  const trimmed = inner.trim();
  if (!trimmed) return null;
  const noHash = trimmed.split("#")[0] ?? trimmed;
  const noQuery = noHash.split("?")[0] ?? noHash;
  const last = noQuery.split("/").filter(Boolean).pop();
  if (!last || !IMAGE_BASENAME_RE.test(last)) return null;
  return last.toLowerCase();
}

/**
 * Browser-resolved URLs like `/cms-global-assets/img/foo.jpg` (relative to
 * `/cms-global-assets/style.css`) are invalid — global assets are flat. Same
 * for `/cms-assets/{slug}/img/foo.jpg`. Rewrite to the canonical path when the
 * basename exists in the asset map.
 */
function rewriteSpuriousCmsImgSegments(
  text: string,
  map: Map<string, string>,
): string {
  if (map.size === 0) return text;
  let out = text.replace(
    /\/cms-global-assets\/img\/([^"'()\s>]+)/gi,
    (m, tail: string) => {
      const base = imageBasenameFromPath(tail);
      if (!base) return m;
      const rep = map.get(base);
      return rep ?? m;
    },
  );
  out = out.replace(
    /(\/cms-assets\/(?:[^/"']+\/)+)img\/([^"'()\s>]+)/gi,
    (_m, _prefix: string, filePart: string) => {
      const base = imageBasenameFromPath(filePart);
      if (!base) return _m;
      const rep = map.get(base);
      return rep ?? _m;
    },
  );
  return out;
}

/**
 * Second pass: any remaining relative `url(...)` that points at an image basename we host
 * (e.g. still `img/banner.jpg` after the first pass) → absolute `/cms-assets/...` or
 * `/cms-global-assets/...`. Fixes browser resolution from `/cms-global-assets/style.css`
 * to broken `/cms-global-assets/img/banner.jpg`.
 */
export function rewriteCssUnresolvedAssetUrls(
  css: string,
  slug: string,
  pageAssetFilenames: string[],
  globalAssetFilenames: string[] = [],
  /** When provided (e.g. from HTML rewriting), avoids rebuilding the map per `<style>` block. */
  existingUrlMap?: Map<string, string>,
): string {
  const map =
    existingUrlMap ??
    buildAssetPublicUrlMap(
      slug,
      listSanitizedPageKeys(pageAssetFilenames),
      globalAssetFilenames,
    );
  if (map.size === 0) return css;

  const replaced = css.replace(
    /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*?))\s*\)/gi,
    (full, dbl?: string, sng?: string, unq?: string) => {
      const raw = (dbl ?? sng ?? unq ?? "").trim();
      if (
        !raw ||
        raw.startsWith("data:") ||
        /^https?:/i.test(raw) ||
        raw.startsWith("//")
      ) {
        return full;
      }
      if (raw.startsWith("/")) {
        const fixed = rewriteSpuriousCmsImgSegments(raw, map);
        if (fixed !== raw) {
          const quote =
            dbl !== undefined ? '"'
            : sng !== undefined ? "'"
            : "";
          const inner = quote ? `${quote}${fixed}${quote}` : fixed;
          return `url(${inner})`;
        }
        return full;
      }

      const base = imageBasenameFromPath(raw);
      if (!base) return full;
      const replacement = map.get(base);
      if (!replacement) return full;

      const quote =
        dbl !== undefined ? '"'
        : sng !== undefined ? "'"
        : "";
      const inner = quote ? `${quote}${replacement}${quote}` : replacement;
      return `url(${inner})`;
    },
  );
  return rewriteSpuriousCmsImgSegments(replaced, map);
}

/**
 * Second pass for HTML: `src`/`href` still like `img/foo.jpg` or `/img/foo.jpg` → CMS asset URL.
 * A later pass fixes broken absolute paths such as `/cms-global-assets/img/…` on the full document.
 */
function rewriteHtmlUnresolvedImageRefs(
  html: string,
  map: Map<string, string>,
): string {
  if (map.size === 0) return html;

  return html.replace(
    /\b(href|src)=(["'])([^"']*)\2/gi,
    (full, attr: string, quote: string, val: string) => {
      const v = val.trim();
      if (
        !v ||
        v.startsWith("data:") ||
        /^https?:/i.test(v) ||
        v.startsWith("//")
      ) {
        return full;
      }
      if (v.startsWith("/cms-")) return full;

      const base = imageBasenameFromPath(v);
      if (!base) return full;
      const replacement = map.get(base);
      if (!replacement) return full;

      return `${attr}=${quote}${replacement}${quote}`;
    },
  );
}

function rewriteInlineStyleTagUrls(
  html: string,
  slug: string,
  pageAssetFilenames: string[],
  globalAssetFilenames: string[],
  urlMap: Map<string, string>,
): string {
  return html.replace(
    /<style(\s[^>]*)?>([\s\S]*?)<\/style>/gi,
    (_full, attrs: string | undefined, inner: string) => {
      let cssInner = rewriteCssAssetRefs(
        inner,
        slug,
        pageAssetFilenames,
        globalAssetFilenames,
      );
      cssInner = rewriteCssUnresolvedAssetUrls(
        cssInner,
        slug,
        pageAssetFilenames,
        globalAssetFilenames,
        urlMap,
      );
      return `<style${attrs ?? ""}>${cssInner}</style>`;
    },
  );
}

/**
 * Rewrites relative link/script references so they load from:
 * - `/cms-assets/{slug}/…` for **page** uploads (first pass)
 * - `/cms-global-assets/…` for **site** uploads when the name is not on the page
 */
export function rewriteHtmlAssetRefs(
  html: string,
  slug: string,
  pageAssetFilenames: string[],
  globalAssetFilenames: string[] = [],
): string {
  const pageKeys = listSanitizedPageKeys(pageAssetFilenames);
  const pageSet = new Set(pageKeys);
  const urlMap = buildAssetPublicUrlMap(slug, pageKeys, globalAssetFilenames);

  let out = html;
  for (const safe of pageKeys) {
    const url = pageAssetPublicPath(slug, safe);
    if (!url) continue;
    out = replaceRefsToFile(out, safe, url);
  }
  for (const name of globalAssetFilenames) {
    const safe = sanitizeAssetFilename(name);
    if (!safe || pageSet.has(safe)) continue;
    const url = siteAssetPublicPath(safe);
    if (!url) continue;
    out = replaceRefsToFile(out, safe, url);
  }
  out = rewriteInlineStyleTagUrls(
    out,
    slug,
    pageAssetFilenames,
    globalAssetFilenames,
    urlMap,
  );
  out = rewriteHtmlUnresolvedImageRefs(out, urlMap);
  out = rewriteSpuriousCmsImgSegments(out, urlMap);
  return out;
}

/**
 * Preview: replace href/src for known files with blob: URLs (revoke via returned list).
 */
const PREVIEW_MIME_BY_EXT: Record<string, string> = {
  ".css": "text/css",
  ".js": "application/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

function previewUrlForAssetContent(
  filename: string,
  content: string,
  blobUrls: string[],
): string {
  if (content.startsWith("data:")) {
    return content;
  }
  const lower = filename.toLowerCase();
  let mime = "application/octet-stream";
  for (const [ext, type] of Object.entries(PREVIEW_MIME_BY_EXT)) {
    if (lower.endsWith(ext)) {
      mime = type;
      break;
    }
  }
  const blob = new Blob([content], { type: mime });
  const u = URL.createObjectURL(blob);
  blobUrls.push(u);
  return u;
}

/** Site-wide assets first; page assets override for preview. */
export function mergeAssetMaps(
  siteWide: Record<string, string>,
  page: Record<string, string>,
): Record<string, string> {
  return { ...siteWide, ...page };
}

export function rewriteHtmlWithBlobUrls(
  html: string,
  assets: Record<string, string>,
): { html: string; blobUrls: string[] } {
  const blobUrls: string[] = [];
  const resolved = new Map<string, string>();
  const entries = Object.entries(assets);

  for (const [name, content] of entries) {
    const safe = sanitizeAssetFilename(name);
    if (!safe || !content || safe.toLowerCase().endsWith(".css")) continue;
    resolved.set(safe, previewUrlForAssetContent(safe, content, blobUrls));
  }

  for (const [name, content] of entries) {
    const safe = sanitizeAssetFilename(name);
    if (!safe || !content || !safe.toLowerCase().endsWith(".css")) continue;
    let cssText = content;
    for (const [fn, u] of resolved.entries()) {
      cssText = replaceUrlRefsInCss(cssText, fn, u);
    }
    resolved.set(safe, previewUrlForAssetContent(safe, cssText, blobUrls));
  }

  let out = html;
  for (const [safe, url] of resolved.entries()) {
    out = replaceRefsToFile(out, safe, url);
  }
  out = out.replace(
    /<style(\s[^>]*)?>([\s\S]*?)<\/style>/gi,
    (_full, attrs: string | undefined, inner: string) => {
      let cssInner = inner;
      for (const [fn, u] of resolved.entries()) {
        cssInner = replaceUrlRefsInCss(cssInner, fn, u);
      }
      return `<style${attrs ?? ""}>${cssInner}</style>`;
    },
  );
  return { html: out, blobUrls };
}
