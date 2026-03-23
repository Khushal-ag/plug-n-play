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

const PREVIEW_EMPTY_PLACEHOLDER = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><p style="padding:1rem;margin:0;font:14px system-ui;color:#64748b">No HTML yet.</p></body></html>`;

/**
 * Build a full document string for iframe srcdoc. Fragments and odd markup are
 * run through the browser HTML parser so preview matches how a real page is
 * structured (head/body, implied tags, etc.).
 */
export function finalizePreviewSrcDoc(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return PREVIEW_EMPTY_PLACEHOLDER;

  if (typeof DOMParser === "undefined") {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body>${trimmed}</body></html>`;
  }

  const doc = new DOMParser().parseFromString(trimmed, "text/html");
  if (doc.querySelector("parsererror")) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body>${trimmed}</body></html>`;
  }

  const root = doc.documentElement;
  if (!root || root.tagName !== "HTML") {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body>${trimmed}</body></html>`;
  }

  const head = doc.querySelector("head");
  if (head) {
    if (!head.querySelector("meta[charset]")) {
      const meta = doc.createElement("meta");
      meta.setAttribute("charset", "utf-8");
      head.insertBefore(meta, head.firstChild);
    }
    if (!head.querySelector('meta[name="viewport"]')) {
      const vp = doc.createElement("meta");
      vp.setAttribute("name", "viewport");
      vp.setAttribute("content", "width=device-width, initial-scale=1");
      head.appendChild(vp);
    }
  }

  return `<!DOCTYPE html>\n${root.outerHTML}`;
}
