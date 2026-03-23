import { listPages } from "@cms/data/pages";
import { AdminSidebarDynamic } from "@cms/ui/admin/admin-client-dynamic";

import type { ReactNode } from "react";

export async function AdminAppShell({ children }: { children: ReactNode }) {
  const rows = await listPages();
  const pages = rows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    isPublished: row.is_published === 1,
  }));

  return (
    <div className="relative min-h-screen bg-background antialiased">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(120%_80%_at_0%_-10%,oklch(0.97_0.04_264/0.22)_0%,transparent_55%),linear-gradient(180deg,oklch(0.99_0.014_264/0.4)_0%,transparent_45%),linear-gradient(168deg,oklch(0.986_0.022_85/0.55)_0%,transparent_52%)]"
      />
      <AdminSidebarDynamic pages={pages} />
      <div className="lg:pl-72">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          {children}
        </div>
      </div>
    </div>
  );
}
