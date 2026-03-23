import { cn } from "@cms/lib/utils";

type Props = {
  published: boolean;
  /** `md` = sidebar row; `sm` = inside table badge */
  size?: "sm" | "md";
  className?: string;
};

export function PublishStatusDot({ published, size = "md", className }: Props) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block shrink-0 rounded-full",
        size === "md" ?
          "h-2 w-2 shadow-sm ring-2 shadow-slate-900/6 ring-card"
        : "h-1.5 w-1.5",
        published ? "bg-success" : "bg-warning",
        className,
      )}
    />
  );
}
