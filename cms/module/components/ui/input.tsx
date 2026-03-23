import * as React from "react";

import { inputInnerShadow } from "@cms/lib/ui-surface";
import { cn } from "@cms/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        className={cn(
          "flex h-10 w-full rounded-lg border border-border/90 bg-background px-3 py-2 text-sm text-foreground transition-[border-color,box-shadow] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/65 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          inputInnerShadow,
          className,
        )}
        ref={ref}
        type={type}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
