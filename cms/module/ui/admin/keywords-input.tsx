"use client";

import { useMemo, useState } from "react";

import { Badge } from "@cms/components/ui/badge";
import { Input } from "@cms/components/ui/input";
import { X } from "lucide-react";

type Props = {
  name: string;
  initialValue?: string;
  placeholder?: string;
};

function normalizeKeyword(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function KeywordsInput({
  name,
  initialValue = "",
  placeholder = "Type keyword and press Enter",
}: Props) {
  const initialKeywords = useMemo(
    () =>
      initialValue
        .split(",")
        .map((k) => normalizeKeyword(k))
        .filter(Boolean),
    [initialValue],
  );

  const [keywords, setKeywords] = useState<string[]>(initialKeywords);
  const [draft, setDraft] = useState("");

  function addKeyword(raw: string) {
    const keyword = normalizeKeyword(raw);
    if (!keyword) return;
    if (keywords.some((k) => k.toLowerCase() === keyword.toLowerCase())) return;
    setKeywords((prev) => [...prev, keyword]);
  }

  function removeKeyword(target: string) {
    setKeywords((prev) => prev.filter((k) => k !== target));
  }

  function flushDraft() {
    if (!draft.trim()) return;
    addKeyword(draft);
    setDraft("");
  }

  return (
    <div className="space-y-2">
      <input name={name} type="hidden" value={keywords.join(",")} />

      <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-2">
        {keywords.length > 0 ?
          keywords.map((keyword) => (
            <Badge
              className="gap-1 pr-1 pl-2"
              key={keyword}
              variant="secondary"
            >
              <span className="max-w-45 truncate">{keyword}</span>
              <button
                aria-label={`Remove ${keyword}`}
                className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => removeKeyword(keyword)}
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        : <span className="text-xs text-muted-foreground/70">
            {placeholder}
          </span>
        }
      </div>

      <Input
        onBlur={flushDraft}
        onChange={(e) => {
          const value = e.target.value;
          if (value.includes(",")) {
            const parts = value.split(",");
            for (const part of parts.slice(0, -1)) addKeyword(part);
            setDraft(parts.at(-1) ?? "");
            return;
          }
          setDraft(value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            flushDraft();
          }
          if (e.key === "Backspace" && !draft && keywords.length > 0) {
            const last = keywords[keywords.length - 1];
            if (last) removeKeyword(last);
          }
        }}
        placeholder={placeholder}
        value={draft}
      />
    </div>
  );
}
