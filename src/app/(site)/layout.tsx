import { loadSitePartial } from "@cms/lib/site-partials";

import type { ReactNode } from "react";

export default async function SiteChromeLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [headerHtml, footerHtml] = await Promise.all([
    loadSitePartial("header"),
    loadSitePartial("footer"),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-card text-foreground">
      {headerHtml ?
        <div
          className="shrink-0"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: headerHtml }}
        />
      : null}
      {children}
      {footerHtml ?
        <div
          className="mt-auto shrink-0"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: footerHtml }}
        />
      : null}
    </div>
  );
}
