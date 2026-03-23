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
import { formatDashboardUpdatedAt } from "@cms/lib/dashboard-updated-at";
import { DashboardPagesTable } from "@cms/ui/admin/dashboard-pages-table";
import { EyeOff, FileText, Globe, Layers } from "lucide-react";

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
    updated_at_display:
      p.updated_at ? formatDashboardUpdatedAt(p.updated_at) : "—",
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Pages
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live vs draft at a glance
          </p>
        </div>
        <Button asChild size="lg">
          <Link href={newPageHref}>
            <FileText className="h-4 w-4" />
            New page
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 p-4 pb-1">
            <CardDescription className="text-[11px] font-medium tracking-wide uppercase">
              Total
            </CardDescription>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/12">
              <Layers className="h-3.5 w-3.5" />
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0 pb-3">
            <CardTitle className="text-2xl font-semibold tracking-tight tabular-nums">
              {pages.length}
            </CardTitle>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 p-4 pb-1">
            <CardDescription className="text-[11px] font-medium tracking-wide uppercase">
              Live
            </CardDescription>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-success/12 text-success ring-1 ring-success/18">
              <Globe className="h-3.5 w-3.5" />
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0 pb-3">
            <CardTitle className="text-2xl font-semibold tracking-tight text-success tabular-nums">
              {published}
            </CardTitle>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 p-4 pb-1">
            <CardDescription className="text-[11px] font-medium tracking-wide uppercase">
              Draft
            </CardDescription>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-warning/14 text-warning ring-1 ring-warning/22">
              <EyeOff className="h-3.5 w-3.5" />
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0 pb-3">
            <CardTitle className="text-2xl font-semibold tracking-tight text-warning tabular-nums">
              {drafts}
            </CardTitle>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        {pages.length === 0 ?
          <CardContent className="flex flex-col items-center px-5 py-14 text-center">
            <p className="text-sm text-muted-foreground">No pages yet</p>
            <Button asChild className="mt-3" variant="link">
              <Link href={newPageHref}>Create one</Link>
            </Button>
          </CardContent>
        : <CardContent className="p-0 sm:p-1">
            <div className="p-4 sm:p-5">
              <DashboardPagesTable pages={tableRows} />
            </div>
          </CardContent>
        }
      </Card>
    </div>
  );
}
