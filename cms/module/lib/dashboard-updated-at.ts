/**
 * Format for admin dashboard "Updated" column. Use only on the server so the
 * string is passed to Client Components — avoids hydration mismatches from
 * `toLocaleString()` differing between Node and the browser.
 */
export function formatDashboardUpdatedAt(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(iso));
}
