import { BookOpen, Layers, MousePointer2, Search } from "lucide-react";

const tips = [
  {
    icon: Layers,
    title: "Structure",
    body: "Use clear sections and heading hierarchy. Paste from Figma-to-code or static exports, then refine in the editor.",
  },
  {
    icon: MousePointer2,
    title: "Layout",
    body: "Full-width heroes and grid sections work well as raw HTML + CSS. Use Split view to check spacing while typing.",
  },
  {
    icon: Search,
    title: "SEO fields",
    body: "Title and meta description power search snippets. Keep descriptions under ~160 characters when possible.",
  },
  {
    icon: BookOpen,
    title: "Drafts",
    body: "Turn off Published to iterate safely. Preview still works while the page stays hidden from public URLs.",
  },
];

export function EditorTips() {
  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-slate-900">Editorial workflow</p>
      <ul className="space-y-4">
        {tips.map(({ icon: Icon, title, body }) => (
          <li className="flex gap-3" key={title}>
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-800">{title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                {body}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
