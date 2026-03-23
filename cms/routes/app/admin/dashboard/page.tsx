import Link from "next/link";

import { requireAdmin } from "@cms/auth/session";
import { Button } from "@cms/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@cms/components/ui/card";
import { cmsAdminBasePath } from "@cms/config";
import { listPages } from "@cms/data/pages";
import { DashboardPagesTable } from "@cms/ui/admin/dashboard-pages-table";
import { FileText } from "lucide-react";

import type { DashboardPageRow } from "@cms/ui/admin/dashboard-pages-table";

export const dynamic = "force-dynamic";

const newPageHref = `${cmsAdminBasePath}/dashboard/new`;

export default async function DashboardPage() {
  await requireAdmin();
  const pages = await listPages();

  const published = pages.filter((p) => p.is_published === 1).length;
  const drafts = pages.length - published;

  const tableRows: DashboardPageRow[] = pages.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    is_published: p.is_published,
    updated_at: p.updated_at,
  }));

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
            Overview
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Pages
          </h1>
          <p className="mt-1 max-w-lg text-sm text-slate-600">
            Manage HTML pages for your site. Use the editor preview to check
            layout before publishing.
          </p>
        </div>
        <Button asChild className="rounded-xl" size="lg">
          <Link href={newPageHref}>
            <FileText className="h-4 w-4" />
            New page
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {pages.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">All pages</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Live</CardDescription>
            <CardTitle className="text-3xl text-emerald-600 tabular-nums">
              {published}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Published</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Drafts</CardDescription>
            <CardTitle className="text-3xl text-amber-600 tabular-nums">
              {drafts}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Not public</p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        {pages.length === 0 ?
          <CardContent className="px-5 py-16 text-center">
            <p className="text-sm text-slate-600">No pages yet.</p>
            <Button asChild className="mt-4" variant="link">
              <Link href={newPageHref}>Create your first page →</Link>
            </Button>
          </CardContent>
        : <CardContent className="p-5">
            <DashboardPagesTable pages={tableRows} />
          </CardContent>
        }
      </Card>
    </div>
  );
}
