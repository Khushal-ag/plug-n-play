import fs from "node:fs/promises";
import path from "node:path";

export type SitePartialName = "header" | "footer";

function isLegacyPlaceholder(name: SitePartialName, html: string): boolean {
  const normalized = html.replace(/\s+/g, " ").trim();
  if (name === "header") {
    return (
      normalized.includes("Shared header") &&
      normalized.includes("src/partials/header.html")
    );
  }
  return (
    normalized.includes("Footer") &&
    normalized.includes("src/partials/footer.html")
  );
}

/**
 * Load optional HTML fragments from `src/partials/{header|footer}.html`.
 * Missing files return an empty string (layout skips that region).
 */
export async function loadSitePartial(name: SitePartialName): Promise<string> {
  const file = path.join(process.cwd(), "src", "partials", `${name}.html`);
  try {
    const html = await fs.readFile(file, "utf8");
    if (!html.trim()) return "";
    // Backward compatibility: ignore the old starter placeholder copy.
    if (isLegacyPlaceholder(name, html)) return "";
    return html;
  } catch {
    return "";
  }
}
