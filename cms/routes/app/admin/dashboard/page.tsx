import Link from "next/link";

import { requireAdmin } from "@cms/auth/session";
import { Badge } from "@cms/components/ui/badge";
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
import { DeletePageButton } from "@cms/ui/admin/delete-page-button";
import { ArrowUpRight, CircleDot, FileText, Pencil } from "lucide-react";

export const dynamic = "force-dynamic";

const newPageHref = `${cmsAdminBasePath}/dashboard/new`;

export default async function DashboardPage() {
  await requireAdmin();
  const pages = await listPages();

  const published = pages.filter((p) => p.is_published === 1).length;
  const drafts = pages.length - published;

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
        : <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs tracking-wider text-slate-500 uppercase">
                  <th className="px-5 py-3 font-semibold">Page</th>
                  <th className="px-5 py-3 font-semibold">Slug</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pages.map((page) => (
                  <tr
                    className="transition-colors hover:bg-slate-50/80"
                    key={page.id}
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">{page.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Updated{" "}
                        {page.updated_at ?
                          new Date(page.updated_at).toLocaleString()
                        : "—"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        className="inline-flex items-center gap-1 font-mono text-xs font-medium text-slate-700 hover:text-slate-900"
                        href={`/${page.slug}`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        /{page.slug}
                        <ArrowUpRight className="h-3 w-3 opacity-60" />
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      {page.is_published === 1 ?
                        <Badge variant="success">
                          <CircleDot className="h-3 w-3" />
                          Published
                        </Badge>
                      : <Badge variant="warning">
                          <CircleDot className="h-3 w-3" />
                          Draft
                        </Badge>
                      }
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild size="sm" variant="ghost">
                          <Link
                            href={`${cmsAdminBasePath}/dashboard/${page.id}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Link>
                        </Button>
                        <DeletePageButton id={page.id} title={page.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      </Card>
    </div>
  );
}
