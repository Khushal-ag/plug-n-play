import { Eye, Layers, Search } from "lucide-react";

const tips = [
  {
    icon: Layers,
    title: "Structure",
    body: "Headings and sections keep pages scannable.",
  },
  {
    icon: Eye,
    title: "Preview",
    body: "Check layout before publishing.",
  },
  {
    icon: Search,
    title: "SEO",
    body: "Description helps search and social cards.",
  },
];

export function EditorTips() {
  return (
    <ul className="grid gap-2.5 sm:grid-cols-3">
      {tips.map(({ icon: Icon, title, body }) => (
        <li className="flex gap-2.5" key={title}>
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-card text-primary ring-1 ring-border">
            <Icon className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-xs font-semibold text-foreground">{title}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
              {body}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
