import { requireAdmin } from "@cms/auth/session";
import { getSiteAssetsMap } from "@cms/data/site-assets";
import { SiteAssetsForm } from "@cms/ui/admin/site-assets-form";

export default async function SiteAssetsPage() {
  await requireAdmin();
  const map = await getSiteAssetsMap();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Shared files
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Reused across pages · same filename on a page overrides here
        </p>
      </div>

      <SiteAssetsForm initialJson={JSON.stringify(map)} />
    </div>
  );
}
