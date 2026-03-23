/**
 * Static multi-page HTML sites use href="about.html" / "index.html".
 * The CMS serves clean URLs (/about, /). Rewrite those hrefs at render time.
 */

function splitBaseQueryHash(val: string): { base: string; suffix: string } {
  const q = val.indexOf("?");
  const h = val.indexOf("#");
  const first =
    q === -1 ? h
    : h === -1 ? q
    : Math.min(q, h);
  if (first === -1) return { base: val, suffix: "" };
  return { base: val.slice(0, first), suffix: val.slice(first) };
}

function shouldSkipHref(val: string): boolean {
  const v = val.trim();
  if (!v || v === "#") return true;
  return /^(https?:|\/\/|mailto:|tel:|javascript:)/i.test(v);
}

/** Directory containing the "file" for this slug (e.g. about → [], blog/post → [blog]). */
function slugToParentDirSegments(slug: string): string[] {
  const parts = slug.split("/").filter(Boolean);
  if (parts.length <= 1) return [];
  return parts.slice(0, -1);
}

/**
 * Turn a path that ends in .html into a site path like /about or /blog/post.
 * Resolves ./ and ../ relative to the current page's logical folder (parent of slug).
 */
export function htmlFileHrefToSitePath(
  hrefPath: string,
  currentPageSlug: string,
): string | null {
  const normalized = hrefPath.replace(/\\/g, "/").trim();
  const { base, suffix } = splitBaseQueryHash(normalized);
  if (!/\.html?$/i.test(base)) return null;

  const absoluteFromRoot = base.startsWith("/");
  const pathPart = absoluteFromRoot ? base.slice(1) : base;

  const stack =
    absoluteFromRoot ? [] : [...slugToParentDirSegments(currentPageSlug)];

  const pieces = pathPart.split("/").filter((p) => p.length > 0);
  for (const piece of pieces) {
    if (piece === "..") {
      stack.pop();
    } else if (piece !== ".") {
      stack.push(piece);
    }
  }

  if (stack.length === 0) {
    return `/${suffix}`;
  }

  const file = stack[stack.length - 1] ?? "";
  if (!/\.html?$/i.test(file)) return null;

  const stem = file.replace(/\.html?$/i, "").toLowerCase();
  const dir = stack.slice(0, -1);

  if (stem === "index") {
    const p = dir.length ? `/${dir.join("/")}` : "/";
    return `${p}${suffix}`;
  }

  return `/${[...dir, stem].join("/")}${suffix}`;
}

/**
 * Rewrite href="*.html" (and ? / # suffixes) to CMS routes. Leaves http(s), mailto, etc. unchanged.
 */
function rewriteAttrHtmlFiles(
  html: string,
  attr: string,
  currentPageSlug: string,
): string {
  const re = new RegExp(`\\b${attr}\\s*=\\s*(["'])((?:(?!\\1).)*)\\1`, "gi");
  return html.replace(re, (full, quote: string, raw: string) => {
    const val = raw.trim();
    if (shouldSkipHref(val)) return full;
    const next = htmlFileHrefToSitePath(val, currentPageSlug);
    if (next === null) return full;
    return `${attr}=${quote}${next}${quote}`;
  });
}

/** Rewrites <a href> and <form action> pointing at *.html to CMS paths. */
export function rewriteHtmlFileLinksToSlugs(
  html: string,
  currentPageSlug: string,
): string {
  let out = rewriteAttrHtmlFiles(html, "href", currentPageSlug);
  out = rewriteAttrHtmlFiles(out, "action", currentPageSlug);
  return out;
}
