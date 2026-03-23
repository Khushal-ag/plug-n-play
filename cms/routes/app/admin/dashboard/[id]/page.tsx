import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@cms/auth/session";
import { Button } from "@cms/components/ui/button";
import { cmsAdminBasePath } from "@cms/config";
import { updatePageAction } from "@cms/data/page-actions";
import { getPageById } from "@cms/data/pages";
import { getSiteAssetsMap } from "@cms/data/site-assets";
import { PageEditor } from "@cms/ui/admin/page-editor";
import { ChevronLeft } from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const page = await getPageById(Number(id));

  if (!page) notFound();

  const siteWideAssets = await getSiteAssetsMap();

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
          Edit
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          {page.title}
        </h1>
        <p className="mt-1 font-mono text-sm text-slate-500">/{page.slug}</p>
      </div>

      <PageEditor
        initial={page}
        saveAction={updatePageAction}
        siteWideAssets={siteWideAssets}
        submitLabel="Save changes"
      />
    </div>
  );
}
