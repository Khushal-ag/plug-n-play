import fs from "node:fs/promises";
import path from "node:path";

export type SitePartialName = "header" | "footer";

/**
 * Load optional HTML fragments from `src/partials/{header|footer}.html`.
 * Missing files return an empty string (layout skips that region).
 */
export async function loadSitePartial(name: SitePartialName): Promise<string> {
  const file = path.join(process.cwd(), "src", "partials", `${name}.html`);
  try {
    return await fs.readFile(file, "utf8");
  } catch {
    return "";
  }
}
