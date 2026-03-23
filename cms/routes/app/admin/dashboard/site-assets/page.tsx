import { requireAdmin } from "@cms/auth/session";
import { getSiteAssetsMap } from "@cms/data/site-assets";
import { SiteAssetsForm } from "@cms/ui/admin/site-assets-form";

export default async function SiteAssetsPage() {
  await requireAdmin();
  const map = await getSiteAssetsMap();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
          Library
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Site-wide assets
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Upload shared CSS, JavaScript, and images once. Every page can use the
          same filenames (e.g.{" "}
          <code className="rounded bg-slate-100 px-1">style.css</code>,{" "}
          <code className="rounded bg-slate-100 px-1">img/banner1.jpg</code> in
          HTML — store the file as{" "}
          <code className="rounded bg-slate-100 px-1">banner1.jpg</code>
          ). <strong>Vendex-style sites:</strong> put{" "}
          <code className="rounded bg-slate-100 px-1">style.css</code> here too
          — background{" "}
          <code className="rounded bg-slate-100 px-1">url(img/…)</code> is
          rewritten when the CSS is served.
        </p>
      </div>

      <SiteAssetsForm initialJson={JSON.stringify(map)} />
    </div>
  );
}
