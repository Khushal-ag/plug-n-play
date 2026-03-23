"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Badge } from "@cms/components/ui/badge";
import { Button } from "@cms/components/ui/button";
import { Input } from "@cms/components/ui/input";
import { cmsAdminBasePath } from "@cms/config";
import { DeletePageButton } from "@cms/ui/admin/delete-page-button";
import { ArrowUpRight, CircleDot, Pencil } from "lucide-react";

export type DashboardPageRow = {
  id: number;
  title: string;
  slug: string;
  is_published: number;
  updated_at: string | null;
};

const PAGE_SIZE = 20;

type Props = { pages: DashboardPageRow[] };

export function DashboardPagesTable({ pages }: Props) {
  const [query, setQuery] = useState("");
  const [pageIndex, setPageIndex] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q),
    );
  }, [pages, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safeIndex = Math.min(pageIndex, pageCount - 1);
  const sliceStart = safeIndex * PAGE_SIZE;
  const pageRows = filtered.slice(sliceStart, sliceStart + PAGE_SIZE);
  const showingFrom = filtered.length === 0 ? 0 : sliceStart + 1;
  const showingTo = Math.min(sliceStart + PAGE_SIZE, filtered.length);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          className="max-w-md"
          onChange={(e) => {
            setQuery(e.target.value);
            setPageIndex(0);
          }}
          placeholder="Search by title or slug…"
          type="search"
          value={query}
        />
        <p className="text-xs text-slate-500">
          {filtered.length === pages.length ?
            `${pages.length} page${pages.length === 1 ? "" : "s"}`
          : `${filtered.length} match${filtered.length === 1 ? "" : "es"} of ${pages.length}`
          }
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs tracking-wider text-slate-500 uppercase">
              <th className="px-5 py-3 font-semibold">Page</th>
              <th className="px-5 py-3 font-semibold">Slug</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ?
              <tr>
                <td
                  className="px-5 py-10 text-center text-sm text-slate-500"
                  colSpan={4}
                >
                  No pages match your search.
                </td>
              </tr>
            : pageRows.map((row) => (
                <tr
                  className="transition-colors hover:bg-slate-50/80"
                  key={row.id}
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{row.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Updated{" "}
                      {row.updated_at ?
                        new Date(row.updated_at).toLocaleString()
                      : "—"}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      className="inline-flex items-center gap-1 font-mono text-xs font-medium text-slate-700 hover:text-slate-900"
                      href={`/${row.slug}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      /{row.slug}
                      <ArrowUpRight className="h-3 w-3 opacity-60" />
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    {row.is_published === 1 ?
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
                        <Link href={`${cmsAdminBasePath}/dashboard/${row.id}`}>
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                      </Button>
                      <DeletePageButton id={row.id} title={row.title} />
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {filtered.length > PAGE_SIZE ?
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row">
          <p className="text-xs text-slate-500">
            Showing {showingFrom}–{showingTo} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              disabled={safeIndex <= 0}
              onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
              size="sm"
              type="button"
              variant="outline"
            >
              Previous
            </Button>
            <span className="text-xs text-slate-600">
              Page {safeIndex + 1} / {pageCount}
            </span>
            <Button
              disabled={safeIndex >= pageCount - 1}
              onClick={() =>
                setPageIndex((i) => Math.min(pageCount - 1, i + 1))
              }
              size="sm"
              type="button"
              variant="outline"
            >
              Next
            </Button>
          </div>
        </div>
      : null}
    </div>
  );
}
