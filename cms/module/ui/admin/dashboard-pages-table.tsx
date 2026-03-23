"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Badge } from "@cms/components/ui/badge";
import { Button } from "@cms/components/ui/button";
import { Input } from "@cms/components/ui/input";
import { cmsAdminBasePath } from "@cms/config";
import { panelChrome } from "@cms/lib/ui-surface";
import { cn } from "@cms/lib/utils";
import { DeletePageButton } from "@cms/ui/admin/delete-page-button";
import { PublishStatusDot } from "@cms/ui/admin/publish-status-dot";
import { ArrowUpRight, Pencil } from "lucide-react";

export type DashboardPageRow = {
  id: number;
  title: string;
  slug: string;
  is_published: number;
  /** Pre-formatted on the server (avoids locale hydration mismatches). */
  updated_at_display: string;
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
          placeholder="Filter…"
          type="search"
          value={query}
        />
        <p className="text-xs text-muted-foreground">
          {filtered.length === pages.length ?
            `${pages.length} total`
          : `${filtered.length} of ${pages.length}`}
        </p>
      </div>

      <div
        className={cn(
          "touch-pan-x overflow-x-auto overscroll-x-contain rounded-xl border border-border/90 bg-card",
          panelChrome,
        )}
      >
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border/80 bg-muted/25 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              <th className="px-4 py-3.5">Page</th>
              <th className="px-4 py-3.5">URL</th>
              <th className="px-4 py-3.5">Live</th>
              <th className="px-4 py-3.5 text-right" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filtered.length === 0 ?
              <tr>
                <td
                  className="px-4 py-10 text-center text-sm text-muted-foreground"
                  colSpan={4}
                >
                  Nothing matches
                </td>
              </tr>
            : pageRows.map((row) => (
                <tr
                  className="transition-colors hover:bg-muted/45"
                  key={row.id}
                >
                  <td className="px-4 py-4">
                    <p className="font-medium text-foreground">{row.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {row.updated_at_display}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      className="inline-flex items-center gap-1 font-mono text-xs font-medium text-primary hover:underline"
                      href={`/${row.slug}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      /{row.slug}
                      <ArrowUpRight className="h-3 w-3 opacity-70" />
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    {row.is_published === 1 ?
                      <Badge
                        title="Visible on the public site"
                        variant="success"
                      >
                        <PublishStatusDot published size="sm" />
                        Yes
                      </Badge>
                    : <Badge title="Not published" variant="warning">
                        <PublishStatusDot published={false} size="sm" />
                        No
                      </Badge>
                    }
                  </td>
                  <td className="px-4 py-4">
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
        <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/20 px-4 py-3 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            {showingFrom}–{showingTo} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              disabled={safeIndex <= 0}
              onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
              size="sm"
              type="button"
              variant="outline"
            >
              Prev
            </Button>
            <span className="text-xs text-muted-foreground">
              {safeIndex + 1}/{pageCount}
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
