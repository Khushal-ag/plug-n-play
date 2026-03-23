import * as React from "react";

import { cn } from "@cms/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import type { VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[color,background-color,box-shadow,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-98 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm shadow-primary/25 hover:bg-primary/92 hover:shadow-md hover:shadow-primary/20",
        secondary:
          "border border-border/90 bg-card text-foreground shadow-sm shadow-slate-900/3.5 ring-1 ring-slate-900/2 hover:bg-muted/85",
        ghost: "text-foreground hover:bg-muted/75",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-border/95 bg-card/40 text-foreground shadow-sm shadow-slate-900/2 hover:border-border hover:bg-muted/65 hover:shadow-md hover:shadow-slate-900/4",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
