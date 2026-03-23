import { cn } from "@cms/lib/utils";
import { cva } from "class-variance-authority";

import type { VariantProps } from "class-variance-authority";
import type * as React from "react";

const alertVariants = cva(
  "relative flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-sm [&_svg]:mt-0.5 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-slate-200 bg-slate-50 text-slate-800",
        destructive:
          "border-red-200 bg-red-50 text-red-800 [&_code]:bg-red-100",
        warning: "border-amber-200/80 bg-amber-50/90 text-amber-900",
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
