import { cardChrome } from "@cms/lib/ui-surface";
import { cn } from "@cms/lib/utils";

const skeletonCard = cn(
  "rounded-xl border border-border/90 bg-card p-6",
  cardChrome,
);

/** Placeholder while PageEditor loads on the client (avoids Turbopack SSR/client drift). */
export function PageEditorFallback() {
  return (
    <div aria-busy className="space-y-5">
      <div className="mb-1 h-[52px] animate-pulse rounded-xl border border-border/90 bg-muted/30 sm:mb-2" />
      <div className={cn("space-y-3", skeletonCard)}>
        <div className="h-5 w-24 rounded bg-muted/60" />
        <div className="h-4 max-w-md rounded bg-muted/40" />
        <div className="h-[420px] animate-pulse rounded-lg bg-muted/25" />
      </div>
      <div className={skeletonCard}>
        <div className="h-5 w-32 rounded bg-muted/60" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="h-10 w-full rounded-lg bg-muted/35" />
          <div className="h-10 w-full rounded-lg bg-muted/35" />
        </div>
      </div>
      <div className={skeletonCard}>
        <div className="h-5 w-28 rounded bg-muted/60" />
        <div className="mt-4 h-10 w-full rounded-lg bg-muted/35" />
      </div>
    </div>
  );
}
