"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { logoutAction } from "@cms/auth/admin-actions";
import { Button } from "@cms/components/ui/button";
import { Input } from "@cms/components/ui/input";
import { Separator } from "@cms/components/ui/separator";
import { cmsAdminBasePath, cmsBrandName, cmsBrandTagline } from "@cms/config";
import { cn } from "@cms/lib/utils";
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Package,
  PenSquare,
  Sparkles,
} from "lucide-react";

type SidebarPage = {
  id: number;
  title: string;
  slug: string;
  isPublished: boolean;
};

type Props = {
  pages: SidebarPage[];
};

const dashboardHref = `${cmsAdminBasePath}/dashboard`;
const siteAssetsHref = `${cmsAdminBasePath}/dashboard/site-assets`;
const newPageHref = `${cmsAdminBasePath}/dashboard/new`;

const nav = [
  { href: dashboardHref, label: "Pages", icon: LayoutDashboard },
  { href: siteAssetsHref, label: "Site assets", icon: Package },
  { href: newPageHref, label: "New page", icon: PenSquare },
] as const;

function isPagesNavActive(pathname: string) {
  if (pathname === dashboardHref) return true;
  if (!pathname.startsWith(`${dashboardHref}/`)) return false;
  const rest = pathname.slice(dashboardHref.length + 1);
  if (rest === "site-assets" || rest === "new") return false;
  return /^\d+$/.test(rest);
}

function isEditPageActive(pathname: string, id: number) {
  return pathname === `${dashboardHref}/${id}`;
}

export function AdminSidebar({ pages }: Props) {
  const pathname = usePathname();
  const [sidebarQuery, setSidebarQuery] = useState("");

  const filteredPages = useMemo(() => {
    const q = sidebarQuery.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q),
    );
  }, [pages, sidebarQuery]);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-sm lg:hidden">
        <Link className="flex items-center gap-2" href={dashboardHref}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-semibold tracking-tight text-slate-900">
            {cmsBrandName}
          </span>
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto pb-0.5">
          {nav.map(({ href, label, icon: Icon }) => {
            const active =
              href === dashboardHref ?
                isPagesNavActive(pathname)
              : pathname === href;
            return (
              <Button
                asChild
                className="shrink-0 gap-1.5 px-3 py-2 text-xs"
                key={href}
                size="sm"
                variant={active ? "default" : "ghost"}
              >
                <Link href={href}>
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              </Button>
            );
          })}
        </nav>
      </header>

      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:h-screen lg:w-72 lg:flex-col lg:border-r lg:border-slate-200/80 lg:bg-white">
        <div className="flex h-16 items-center gap-3 border-b border-slate-200/80 px-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-slate-900">
              {cmsBrandName}
            </p>
            <p className="text-xs text-slate-500">{cmsBrandTagline}</p>
          </div>
        </div>

        <nav className="p-4">
          <p className="mb-2 px-3 text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
            Workspace
          </p>
          <div className="space-y-1">
            {nav.map(({ href, label, icon: Icon }) => {
              const active =
                href === dashboardHref ?
                  isPagesNavActive(pathname)
                : pathname === href;
              return (
                <Button
                  asChild
                  className="h-auto w-full justify-start gap-3 rounded-xl px-3 py-2.5 text-sm font-medium"
                  key={href}
                  variant={active ? "default" : "ghost"}
                >
                  <Link href={href}>
                    <Icon className="h-4 w-4 shrink-0 opacity-90" />
                    {label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </nav>

        <div className="flex min-h-0 flex-1 flex-col px-4 pb-2">
          <p className="mb-2 px-3 text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
            Pages ({pages.length})
          </p>
          <Input
            className="mb-2 h-8 text-xs"
            onChange={(e) => setSidebarQuery(e.target.value)}
            placeholder="Search pages…"
            type="search"
            value={sidebarQuery}
          />
          {pages.length === 0 ?
            <p className="px-3 text-xs text-slate-500">No pages yet.</p>
          : filteredPages.length === 0 ?
            <p className="px-3 text-xs text-slate-500">No matches.</p>
          : <div className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain pr-1">
              {filteredPages.map((page) => {
                const active = isEditPageActive(pathname, page.id);
                return (
                  <Link
                    className={cn(
                      "block rounded-lg px-3 py-2 transition-colors",
                      active ? "bg-slate-100" : "hover:bg-slate-50",
                    )}
                    href={`${dashboardHref}/${page.id}`}
                    key={page.id}
                  >
                    <p className="truncate text-sm font-medium text-slate-800">
                      {page.title}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 shrink-0 rounded-full",
                          page.isPublished ? "bg-emerald-500" : "bg-amber-500",
                        )}
                      />
                      <span className="truncate">/{page.slug}</span>
                    </p>
                  </Link>
                );
              })}
            </div>
          }
        </div>

        <div className="border-t border-slate-200/80 p-4">
          <Button
            asChild
            className="mb-3 h-auto w-full justify-start gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600"
            variant="ghost"
          >
            <Link href="/" target="_blank">
              <ExternalLink className="h-4 w-4" />
              View site
            </Link>
          </Button>
          <Separator className="mb-3" />
          <form action={logoutAction}>
            <Button
              className="h-auto w-full justify-start gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700"
              type="submit"
              variant="ghost"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>
    </>
  );
}
