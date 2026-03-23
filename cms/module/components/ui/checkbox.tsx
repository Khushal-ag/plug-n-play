"use client";

import * as React from "react";

import { cn } from "@cms/lib/utils";
import { Check } from "lucide-react";

export type CheckboxProps = Omit<
  React.ComponentProps<"input">,
  "type" | "className"
> & {
  className?: string;
  /** Text shown to the right of the control */
  label?: React.ReactNode;
  /** Classes for the label text (when `label` is set) */
  labelClassName?: string;
};

/**
 * Styled checkbox (native input for forms). Visual box + check icon.
 */
const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, labelClassName, id, disabled, ...props }, ref) => {
    const uid = React.useId();
    const inputId = id ?? uid;

    const box = (
      <span className="relative inline-grid h-5 w-5 shrink-0 place-items-center">
        <input
          ref={ref}
          className="peer z-10 col-start-1 row-start-1 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          disabled={disabled}
          id={inputId}
          type="checkbox"
          {...props}
        />
        <span
          aria-hidden
          className={cn(
            "col-start-1 row-start-1 flex h-5 w-5 items-center justify-center rounded-md border-2 border-border bg-card shadow-sm transition-[border-color,background-color,box-shadow]",
            "peer-hover:border-muted-foreground/40",
            "peer-focus-visible:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring/40 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
            "peer-checked:border-primary peer-checked:bg-primary peer-checked:shadow-sm",
            "peer-disabled:opacity-50",
            "peer-checked:[&>svg]:scale-100 peer-checked:[&>svg]:opacity-100",
          )}
        >
          <Check
            className="h-3.5 w-3.5 scale-90 text-primary-foreground opacity-0 transition-[opacity,transform] duration-150"
            strokeWidth={2.75}
          />
        </span>
      </span>
    );

    if (label === undefined) {
      return (
        <div className={cn("inline-flex items-center", className)}>{box}</div>
      );
    }

    return (
      <label
        className={cn(
          "inline-flex cursor-pointer items-center gap-3 select-none",
          disabled && "cursor-not-allowed",
          className,
        )}
        htmlFor={inputId}
      >
        {box}
        <span
          className={cn(
            "text-sm leading-snug font-medium text-foreground",
            disabled && "text-muted-foreground",
            labelClassName,
          )}
        >
          {label}
        </span>
      </label>
    );
  },
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
