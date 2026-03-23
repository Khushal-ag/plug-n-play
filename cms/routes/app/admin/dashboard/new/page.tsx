import Link from "next/link";

import { requireAdmin } from "@cms/auth/session";
import { Button } from "@cms/components/ui/button";
import { cmsAdminBasePath } from "@cms/config";
import { createPageAction } from "@cms/data/page-actions";
import { getSiteAssetsMap } from "@cms/data/site-assets";
import { PageEditorDynamic } from "@cms/ui/admin/admin-client-dynamic";
import { ChevronLeft } from "lucide-react";

export default async function NewPage() {
  await requireAdmin();

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
          New page
        </h1>
      </div>

      <PageEditorDynamic
        saveAction={createPageAction}
        siteWideAssets={siteWideAssets}
        submitLabel="Create page"
      />
    </div>
  );
}
