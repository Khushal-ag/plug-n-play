import { cn } from "@cms/lib/utils";
import { cva } from "class-variance-authority";

import type { VariantProps } from "class-variance-authority";
import type * as React from "react";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring/50 focus:ring-offset-2 focus:ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-muted text-foreground/90 hover:bg-muted/80",
        secondary:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
        success:
          "gap-1 rounded-md border-success/20 bg-success/10 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-success-foreground shadow-sm ring-1 ring-success/15 ring-inset",
        warning:
          "gap-1 rounded-md border-warning/25 bg-warning/10 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-warning-foreground shadow-sm ring-1 ring-warning/20 ring-inset",
        outline: "border-border text-foreground/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
