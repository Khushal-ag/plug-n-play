import { listPages } from "@cms/data/pages";
import { AdminSidebar } from "@cms/ui/admin/admin-sidebar";

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/80 text-slate-900 antialiased">
      <AdminSidebar pages={pages} />
      <div className="lg:pl-72">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}
