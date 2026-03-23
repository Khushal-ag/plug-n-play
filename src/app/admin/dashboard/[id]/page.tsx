import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@cms/auth/session";
import { Button } from "@cms/components/ui/button";
import { cmsAdminBasePath } from "@cms/config";
import { updatePageAction } from "@cms/data/page-actions";
import { getPageById } from "@cms/data/pages";
import { getSiteAssetsMap } from "@cms/data/site-assets";
import { PageEditorDynamic } from "@cms/ui/admin/admin-client-dynamic";
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
    <div className="space-y-6">
      <div>
        <Button
          asChild
          className="mb-3 h-auto p-0 text-muted-foreground"
          variant="link"
        >
          <Link href={listHref}>
            <ChevronLeft className="h-4 w-4" />
            Pages
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {page.title}
        </h1>
        <p className="mt-1 font-mono text-sm text-muted-foreground">
          /{page.slug}
        </p>
      </div>

      <PageEditorDynamic
        initial={page}
        saveAction={updatePageAction}
        siteWideAssets={siteWideAssets}
        submitLabel="Save"
      />
    </div>
  );
}
