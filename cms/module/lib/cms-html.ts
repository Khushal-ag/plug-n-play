/**
 * Full-site HTML often includes <!DOCTYPE>, <html>, <head>, <body>.
 * Injecting that inside Next.js's <main> is invalid and makes the browser
 * rewrite the DOM, which causes React hydration mismatches and breaks
 * relative URL resolution. Flatten to content safe for one wrapper.
 */
export function normalizeHtmlForMainInjection(html: string): string {
  const s = html.trim().replace(/\r\n/g, "\n");
  if (!/<!doctype|<\s*html[\s>]/i.test(s)) {
    return s;
  }

  const headMatch = s.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const bodyMatch = s.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

  const headInner = headMatch?.[1]?.trim() ?? "";
  let bodyInner = bodyMatch?.[1]?.trim() ?? "";

  if (!bodyMatch) {
    bodyInner = s
      .replace(/<!DOCTYPE[^>]*>/gi, "")
      .replace(/<\/?html[^>]*>/gi, "")
      .replace(/<head[\s\S]*?<\/head>/gi, "")
      .trim();
  }

  if (!headInner && !bodyInner) {
    return s;
  }

  return [headInner, bodyInner].filter(Boolean).join("\n\n");
}
