import Link from "next/link";

import { requireAdmin } from "@cms/auth/session";
import { Button } from "@cms/components/ui/button";
import { cmsAdminBasePath } from "@cms/config";
import { createPageAction } from "@cms/data/page-actions";
import { PageEditor } from "@cms/ui/admin/page-editor";
import { ChevronLeft } from "lucide-react";

export default async function NewPage() {
  await requireAdmin();

  const listHref = `${cmsAdminBasePath}/dashboard`;

  return (
    <div className="space-y-8">
      <div>
        <Button asChild className="mb-4 h-auto p-0" variant="link">
          <Link href={listHref}>
            <ChevronLeft className="h-4 w-4" />
            All pages
          </Link>
        </Button>
        <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
          Create
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          New page
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Use the HTML editor with syntax highlighting. Switch to Split or
          Preview to see your markup while you work.
        </p>
      </div>

      <PageEditor saveAction={createPageAction} submitLabel="Create page" />
    </div>
  );
}
