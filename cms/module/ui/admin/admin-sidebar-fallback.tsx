import { cmsBrandName } from "@cms/config";
import { LayoutDashboard } from "lucide-react";

/** Static shell while the real sidebar loads on the client (avoids Turbopack SSR/client drift). */
export function AdminSidebarFallback() {
  return (
    <>
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border/90 bg-card/90 px-3 py-2.5 shadow-sm shadow-slate-900/4 backdrop-blur-md sm:px-4 lg:hidden">
        <div
          aria-hidden
          className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-muted/50 ring-1 ring-border/60"
        />
        <span className="min-w-0 flex-1 truncate py-1 text-sm font-semibold text-foreground">
          {cmsBrandName}
        </span>
      </header>

      <aside
        aria-busy
        className="hidden lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:h-screen lg:w-72 lg:flex-col lg:border-r lg:border-border/90 lg:bg-card lg:shadow-[4px_0_32px_-12px_rgba(15,23,42,0.08)]"
      >
        <div className="flex h-16 items-center gap-3 border-b border-border/80 bg-linear-to-b from-muted/35 to-card px-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
            <LayoutDashboard className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1 space-y-1.5 py-0.5">
            <div className="h-4 max-w-28 rounded bg-muted/70" />
            <div className="h-3 max-w-36 rounded bg-muted/50" />
          </div>
        </div>

        <nav aria-hidden className="space-y-0.5 p-3">
          {[1, 2, 3].map((i) => (
            <div
              className="h-10 w-full animate-pulse rounded-lg bg-muted/35"
              key={i}
            />
          ))}
        </nav>

        <div className="flex min-h-0 flex-1 flex-col px-3 pb-2">
          <div className="mb-2 h-3 max-w-22 animate-pulse rounded bg-muted/40 px-3" />
          <div className="mb-2 h-9 w-full animate-pulse rounded-lg bg-muted/40" />
          <div className="min-h-0 flex-1 space-y-1 overflow-hidden rounded-xl border border-border/60 bg-muted/20 p-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                className="h-14 animate-pulse rounded-lg bg-muted/30"
                key={i}
              />
            ))}
          </div>
        </div>

        <div aria-hidden className="border-t border-border/80 bg-muted/10 p-3">
          <div className="mb-2 h-10 w-full rounded-lg bg-muted/30" />
          <div className="mb-2 h-px w-full bg-border" />
          <div className="h-10 w-full rounded-lg bg-muted/30" />
        </div>
      </aside>
    </>
  );
}
