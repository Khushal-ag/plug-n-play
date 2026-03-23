import { cn } from "@cms/lib/utils";
import { cva } from "class-variance-authority";

import type { VariantProps } from "class-variance-authority";
import type * as React from "react";

const alertVariants = cva(
  "relative flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-sm [&_svg]:mt-0.5 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-border bg-muted/50 text-foreground [&_code]:bg-card",
        destructive:
          "border-destructive/25 bg-destructive/10 text-destructive [&_code]:bg-destructive/15",
        warning: "border-warning/30 bg-warning/12 text-warning-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type AlertProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof alertVariants>;

function Alert({ className, variant, ...props }: AlertProps) {
  return (
    <div
      className={cn(alertVariants({ variant }), className)}
      role="alert"
      {...props}
    />
  );
}

function AlertTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <h5
      className={cn(
        "mb-1 leading-none font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      className={cn("text-sm leading-relaxed [&_p]:mb-2", className)}
      {...props}
    />
  );
}

export { Alert, AlertDescription, AlertTitle };
