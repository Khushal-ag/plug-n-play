"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { logoutAction } from "@cms/auth/admin-actions";
import { Button } from "@cms/components/ui/button";
import { Input } from "@cms/components/ui/input";
import { Separator } from "@cms/components/ui/separator";
import { cmsAdminBasePath, cmsBrandName, cmsBrandTagline } from "@cms/config";
import { innerWell } from "@cms/lib/ui-surface";
import { cn } from "@cms/lib/utils";
import { PublishStatusDot } from "@cms/ui/admin/publish-status-dot";
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PenSquare,
  X,
} from "lucide-react";
import { createPortal } from "react-dom";

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
  { href: siteAssetsHref, label: "Shared files", icon: Package },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMounted, setMobileMounted] = useState(false);

  useEffect(() => {
    setMobileMounted(true);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileMenuOpen]);

  const filteredPages = useMemo(() => {
    const q = sidebarQuery.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q),
    );
  }, [pages, sidebarQuery]);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border/90 bg-card/90 px-3 py-2.5 shadow-sm shadow-slate-900/4 backdrop-blur-md sm:px-4 lg:hidden">
        <Button
          aria-controls="admin-mobile-menu"
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          className="h-10 w-10 shrink-0 p-0"
          onClick={() => setMobileMenuOpen((o) => !o)}
          type="button"
          variant="outline"
        >
          {mobileMenuOpen ?
            <X className="h-5 w-5" />
          : <Menu className="h-5 w-5" />}
        </Button>
        <Link
          className="min-w-0 flex-1 truncate py-1 text-sm font-semibold text-foreground"
          href={dashboardHref}
          onClick={closeMobileMenu}
        >
          {cmsBrandName}
        </Link>
      </header>

      {mobileMounted && mobileMenuOpen ?
        createPortal(
          <>
            <button
              aria-label="Close menu"
              className="fixed inset-0 z-190 bg-foreground/40 backdrop-blur-sm transition-opacity"
              onClick={closeMobileMenu}
              type="button"
            />
            <div
              aria-modal
              className="fixed inset-y-0 left-0 z-200 flex w-[min(100%,20rem)] flex-col border-r border-border/90 bg-card shadow-2xl shadow-slate-900/15"
              id="admin-mobile-menu"
              role="dialog"
            >
              <div className="flex items-start justify-between gap-3 border-b border-border/80 bg-linear-to-b from-muted/35 to-card px-4 py-4">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                    <LayoutDashboard className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-foreground">
                      {cmsBrandName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {cmsBrandTagline}
                    </p>
                  </div>
                </div>
                <Button
                  aria-label="Close menu"
                  className="h-9 w-9 shrink-0 p-0"
                  onClick={closeMobileMenu}
                  type="button"
                  variant="ghost"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav
                aria-label="Admin sections"
                className="border-b border-border/60 p-3"
                role="navigation"
              >
                <p className="mb-2 px-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                  Menu
                </p>
                <div className="space-y-0.5">
                  {nav.map(({ href, label, icon: Icon }) => {
                    const active =
                      href === dashboardHref ?
                        isPagesNavActive(pathname)
                      : pathname === href;
                    return (
                      <Button
                        asChild
                        className={cn(
                          "h-auto w-full justify-start gap-3 rounded-lg px-3 py-3 text-sm font-medium shadow-none",
                          active ?
                            "border border-primary/20 bg-primary/10 text-primary hover:bg-primary/14"
                          : "text-foreground hover:bg-muted/80",
                        )}
                        key={href}
                        variant="ghost"
                      >
                        <Link href={href} onClick={closeMobileMenu}>
                          <Icon
                            className={cn(
                              "h-4 w-4 shrink-0",
                              active ? "text-primary" : "text-muted-foreground",
                            )}
                          />
                          {label}
                        </Link>
                      </Button>
                    );
                  })}
                </div>
              </nav>

              <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pt-3 pb-2">
                <p className="mb-2 px-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                  All pages ({pages.length})
                </p>
                <Input
                  className="mb-2 h-10 text-sm"
                  onChange={(e) => setSidebarQuery(e.target.value)}
                  placeholder="Search pages…"
                  type="search"
                  value={sidebarQuery}
                />
                {pages.length === 0 ?
                  <p className="px-2 text-sm text-muted-foreground">
                    No pages yet.
                  </p>
                : filteredPages.length === 0 ?
                  <p className="px-2 text-sm text-muted-foreground">
                    No matches.
                  </p>
                : <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain rounded-xl border border-border/60 bg-muted/20 p-1 shadow-inner">
                    {filteredPages.map((page) => {
                      const active = isEditPageActive(pathname, page.id);
                      return (
                        <Link
                          aria-label={`${page.title}, ${page.isPublished ? "live" : "draft"}, /${page.slug}`}
                          className={cn(
                            "block rounded-lg px-3 py-2.5 text-sm transition-colors",
                            active ?
                              "border border-primary/15 bg-primary/8 font-medium text-foreground"
                            : "text-foreground/90 active:bg-muted/80",
                          )}
                          href={`${dashboardHref}/${page.id}`}
                          key={page.id}
                          onClick={closeMobileMenu}
                        >
                          <p className="truncate">{page.title}</p>
                          <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                            <span
                              className="inline-flex items-center"
                              title={
                                page.isPublished ? "Live on site" : "Draft"
                              }
                            >
                              <PublishStatusDot published={page.isPublished} />
                            </span>
                            <span className="min-w-0 truncate font-mono">
                              /{page.slug}
                            </span>
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                }
              </div>

              <div className="border-t border-border/80 bg-muted/10 p-3">
                <Button
                  asChild
                  className="group mb-2 h-auto min-h-11 w-full justify-start gap-3 rounded-lg border-border/70 bg-card/30 px-3 py-2.5 text-sm font-medium text-muted-foreground shadow-sm"
                  variant="outline"
                >
                  <Link
                    href="/"
                    onClick={closeMobileMenu}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/50 text-muted-foreground ring-1 ring-border/55 group-hover:bg-background group-hover:text-foreground">
                      <ExternalLink className="h-4 w-4" />
                    </span>
                    View site
                  </Link>
                </Button>
                <form action={logoutAction}>
                  <Button
                    className="group h-auto min-h-11 w-full justify-start gap-3 rounded-lg border-border/70 px-3 py-2.5 text-sm font-medium text-muted-foreground shadow-sm hover:border-destructive/40 hover:bg-destructive/7 hover:text-destructive"
                    type="submit"
                    variant="outline"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/50 text-muted-foreground ring-1 ring-border/55 group-hover:bg-destructive/12 group-hover:text-destructive">
                      <LogOut className="h-4 w-4" />
                    </span>
                    Sign out
                  </Button>
                </form>
              </div>
            </div>
          </>,
          document.body,
        )
      : null}

      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:h-screen lg:w-72 lg:flex-col lg:border-r lg:border-border/90 lg:bg-card lg:shadow-[4px_0_32px_-12px_rgba(15,23,42,0.08)]">
        <div className="flex h-16 items-center gap-3 border-b border-border/80 bg-linear-to-b from-muted/35 to-card px-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
            <LayoutDashboard className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {cmsBrandName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {cmsBrandTagline}
            </p>
          </div>
        </div>

        <nav className="space-y-0.5 p-3">
          {nav.map(({ href, label, icon: Icon }) => {
            const active =
              href === dashboardHref ?
                isPagesNavActive(pathname)
              : pathname === href;
            return (
              <Button
                asChild
                className={cn(
                  "h-auto w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium shadow-none",
                  active ?
                    "border border-primary/20 bg-primary/10 text-primary hover:bg-primary/14"
                  : "text-foreground hover:bg-muted/80",
                )}
                key={href}
                variant="ghost"
              >
                <Link href={href}>
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  {label}
                </Link>
              </Button>
            );
          })}
        </nav>

        <div className="flex min-h-0 flex-1 flex-col px-3 pb-2">
          <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            All pages ({pages.length})
          </p>
          <Input
            className="mb-2 h-9 text-sm"
            onChange={(e) => setSidebarQuery(e.target.value)}
            placeholder="Search…"
            type="search"
            value={sidebarQuery}
          />
          {pages.length === 0 ?
            <p className="px-3 text-xs text-muted-foreground">No pages yet.</p>
          : filteredPages.length === 0 ?
            <p className="px-3 text-xs text-muted-foreground">No matches.</p>
          : <div
              className={cn(
                "min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain rounded-xl border border-border/60 bg-muted/20 p-1 pr-0.5",
                innerWell,
              )}
            >
              {filteredPages.map((page) => {
                const active = isEditPageActive(pathname, page.id);
                return (
                  <Link
                    aria-label={`${page.title}, ${page.isPublished ? "live" : "draft"}, /${page.slug}`}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-sm transition-colors",
                      active ?
                        "border border-primary/15 bg-primary/8 font-medium text-foreground"
                      : "text-foreground/90 hover:bg-muted/80",
                    )}
                    href={`${dashboardHref}/${page.id}`}
                    key={page.id}
                  >
                    <p className="truncate">{page.title}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span
                        className="inline-flex items-center"
                        title={page.isPublished ? "Live on site" : "Draft"}
                      >
                        <PublishStatusDot published={page.isPublished} />
                      </span>
                      <span className="min-w-0 truncate font-mono">
                        /{page.slug}
                      </span>
                    </p>
                  </Link>
                );
              })}
            </div>
          }
        </div>

        <div className="border-t border-border/80 bg-muted/10 p-3">
          <Button
            asChild
            className="group mb-2 h-auto min-h-10 w-full justify-start gap-3 rounded-lg border-border/70 bg-card/30 px-3 py-2.5 text-sm font-medium text-muted-foreground shadow-sm hover:border-border hover:bg-muted/50 hover:text-foreground hover:shadow-md"
            variant="outline"
          >
            <Link href="/" rel="noreferrer" target="_blank">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/50 text-muted-foreground ring-1 ring-border/55 transition-[background-color,color,box-shadow] group-hover:bg-background group-hover:text-foreground group-hover:ring-border/80">
                <ExternalLink className="h-4 w-4" />
              </span>
              View site
            </Link>
          </Button>
          <Separator className="mb-2" />
          <form action={logoutAction}>
            <Button
              className="group h-auto min-h-10 w-full justify-start gap-3 rounded-lg border-border/70 px-3 py-2.5 text-sm font-medium text-muted-foreground shadow-sm hover:border-destructive/40 hover:bg-destructive/7 hover:text-destructive hover:shadow-md focus-visible:ring-destructive/35"
              type="submit"
              variant="outline"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/50 text-muted-foreground ring-1 ring-border/55 transition-[background-color,color,box-shadow] group-hover:bg-destructive/12 group-hover:text-destructive group-hover:ring-destructive/30">
                <LogOut className="h-4 w-4" />
              </span>
              Sign out
            </Button>
          </form>
        </div>
      </aside>
    </>
  );
}
