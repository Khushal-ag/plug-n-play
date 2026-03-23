"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";

import { Button } from "@cms/components/ui/button";
import { Checkbox } from "@cms/components/ui/checkbox";
import { finalizePreviewSrcDoc } from "@cms/lib/cms-html";
import { rewriteHtmlFileLinksToSlugs } from "@cms/lib/cms-page-links";
import { rewriteHtmlWithBlobUrls } from "@cms/lib/page-assets";
import {
  cardChrome,
  innerWell,
  softShadowSm,
  toolClusterShadow,
} from "@cms/lib/ui-surface";
import { cn } from "@cms/lib/utils";
import { html } from "@codemirror/lang-html";
import { githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";
import {
  Code2,
  Copy,
  ExternalLink,
  Eye,
  FileCode2,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { createPortal } from "react-dom";

type Props = {
  value: string;
  onChange: (value: string) => void;
  /** Wired to uploaded page CSS/JS so preview resolves the same refs as the live site */
  previewAssets?: Record<string, string>;
  /** When set, *.html hrefs in preview match the live site (same as this page slug) */
  previewLinkSlug?: string;
};

type ViewMode = "code" | "preview";

function buildIframePreviewDoc(
  raw: string,
  previewAssets: Record<string, string> | undefined,
  previewLinkSlug: string | undefined,
): { doc: string; blobUrls: string[] } {
  if (!raw.trim()) {
    return { doc: finalizePreviewSrcDoc(""), blobUrls: [] };
  }
  let text = raw;
  if (previewLinkSlug) {
    text = rewriteHtmlFileLinksToSlugs(text, previewLinkSlug);
  }
  const assets = previewAssets ?? {};
  let processed = text;
  const blobUrls: string[] = [];
  if (Object.keys(assets).length > 0) {
    const r = rewriteHtmlWithBlobUrls(text, assets);
    processed = r.html;
    blobUrls.push(...r.blobUrls);
  }
  return { doc: finalizePreviewSrcDoc(processed), blobUrls };
}

export function HtmlWorkspace({
  value,
  onChange,
  previewAssets,
  previewLinkSlug,
}: Props) {
  const [allowScripts, setAllowScripts] = useState(true);
  const [editorHeight, setEditorHeight] = useState(680);
  const [isMaximized, setIsMaximized] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<ViewMode>("code");
  const [iframeSrcDoc, setIframeSrcDoc] = useState(
    () => buildIframePreviewDoc(value, previewAssets, previewLinkSlug).doc,
  );

  const extensions = useMemo(() => [githubLight, html()], []);
  const workspaceHeight = isMaximized ? 920 : editorHeight;
  const workspaceHeightPx = `${workspaceHeight}px`;

  useEffect(() => {
    setMounted(true);
  }, []);

  /** Shorter editor on phones so the page scrolls naturally (default height is tall). */
  useEffect(() => {
    if (!window.matchMedia("(max-width: 639px)").matches) return;
    const cap = Math.min(
      520,
      Math.max(300, Math.round(window.innerHeight * 0.42)),
    );
    setEditorHeight((h) => Math.min(h, cap));
  }, []);

  useLayoutEffect(() => {
    const { doc, blobUrls } = buildIframePreviewDoc(
      value,
      previewAssets,
      previewLinkSlug,
    );
    setIframeSrcDoc(doc);
    return () => {
      blobUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [value, previewAssets, previewLinkSlug]);

  function increaseHeight() {
    setEditorHeight((h) => Math.min(h + 80, 980));
  }

  function decreaseHeight() {
    setEditorHeight((h) => Math.max(h - 80, 420));
  }

  async function copyHtml() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Ignore clipboard failures in restricted browser contexts.
    }
  }

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "flex flex-col gap-3 rounded-xl border border-border/90 bg-linear-to-b from-muted/45 to-card p-2.5 sm:flex-row sm:items-center sm:justify-between",
          cardChrome,
        )}
      >
        <div
          className={cn(
            "inline-flex rounded-lg border border-border/90 bg-muted/50 p-1",
            innerWell,
          )}
        >
          <button
            className={
              view === "code" ?
                "inline-flex h-8 items-center gap-2 rounded-md bg-card px-3 text-xs font-semibold text-foreground shadow-sm ring-1 ring-border/80"
              : "inline-flex h-8 items-center gap-2 rounded-md px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-card/90 hover:text-foreground"
            }
            onClick={() => setView("code")}
            type="button"
          >
            <Code2 className="h-3.5 w-3.5" />
            Code
          </button>
          <button
            className={
              view === "preview" ?
                "inline-flex h-8 items-center gap-2 rounded-md bg-card px-3 text-xs font-semibold text-foreground shadow-sm ring-1 ring-border/80"
              : "inline-flex h-8 items-center gap-2 rounded-md px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-card/90 hover:text-foreground"
            }
            onClick={() => setView("preview")}
            type="button"
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
        </div>

        <div className="flex w-full max-w-full flex-col gap-2 sm:w-auto sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-1 rounded-lg border border-border/90 bg-card/80 p-1",
                toolClusterShadow,
              )}
            >
              <Button
                className="h-7 w-7 p-0"
                onClick={decreaseHeight}
                size="sm"
                title="Decrease editor height"
                type="button"
                variant="ghost"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="min-w-[56px] text-center text-[11px] font-medium text-muted-foreground">
                {workspaceHeight}px
              </span>
              <Button
                className="h-7 w-7 p-0"
                onClick={increaseHeight}
                size="sm"
                title="Increase editor height"
                type="button"
                variant="ghost"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div
              className={cn(
                "flex items-center gap-1 rounded-lg border border-border/90 bg-card/80 p-1",
                toolClusterShadow,
              )}
            >
              <Button
                className="h-7 gap-1.5 px-2 text-[11px]"
                onClick={() => setIsMaximized((v) => !v)}
                size="sm"
                type="button"
                variant="ghost"
              >
                {isMaximized ?
                  <>
                    <Minimize2 className="h-3.5 w-3.5" />
                    Min
                  </>
                : <>
                    <Maximize2 className="h-3.5 w-3.5" />
                    Max
                  </>
                }
              </Button>
              <Button
                className="h-7 gap-1.5 px-2 text-[11px]"
                onClick={copyHtml}
                size="sm"
                type="button"
                variant="ghost"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </Button>
            </div>
          </div>
          <Checkbox
            checked={allowScripts}
            className="gap-2 max-sm:w-full max-sm:border-t max-sm:border-border/50 max-sm:pt-2 sm:ml-1"
            id="preview-allow-scripts"
            label="Run scripts in preview"
            labelClassName="text-xs font-medium text-muted-foreground normal-case"
            onChange={(e) => setAllowScripts(e.target.checked)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {view === "code" ?
          <div
            className={cn(
              "group relative overflow-hidden rounded-xl border border-border/90 bg-card",
              cardChrome,
            )}
          >
            <div className="absolute top-2 right-2 z-10 opacity-100 transition-opacity duration-150 sm:opacity-0 sm:group-hover:opacity-100">
              <Button
                className="h-7 gap-1 rounded-md border border-border bg-card/95 px-2 text-[11px] shadow-sm"
                onClick={() => setPreviewOpen(true)}
                size="sm"
                type="button"
                variant="ghost"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Bigger preview
              </Button>
            </div>
            <CodeMirror
              className="text-[13px] leading-relaxed"
              extensions={extensions}
              height={workspaceHeightPx}
              onChange={onChange}
              value={value}
            />
          </div>
        : <div
            className={cn(
              "flex flex-col overflow-hidden rounded-xl border border-border/90 bg-muted/25 ring-1 ring-slate-900/3",
              innerWell,
            )}
          >
            <div className="border-b border-border/80 bg-card/95 px-3 py-2.5">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                <FileCode2 className="h-3.5 w-3.5" />
                Preview
              </p>
            </div>
            <div className="relative min-h-0 flex-1 bg-card">
              <iframe
                className="w-full"
                sandbox={
                  allowScripts ?
                    "allow-scripts allow-same-origin"
                  : "allow-same-origin"
                }
                srcDoc={iframeSrcDoc}
                style={{ height: workspaceHeightPx }}
                title="HTML preview"
              />
            </div>
          </div>
        }
      </div>

      <div
        className={cn(
          "rounded-xl border border-border/85 bg-muted/35 px-3.5 py-2.5",
          softShadowSm,
        )}
      >
        <p className="text-xs leading-relaxed text-muted-foreground">
          Preview is approximate. Enable{" "}
          <span className="font-medium text-foreground">scripts</span> only for
          trusted code.
        </p>
      </div>

      {mounted && previewOpen ?
        createPortal(
          <>
            <button
              aria-label="Close preview overlay"
              className="fixed inset-0 z-90 bg-foreground/35 backdrop-blur-sm"
              onClick={() => setPreviewOpen(false)}
              type="button"
            />
            <aside className="fixed inset-2 z-100 flex flex-col overflow-hidden rounded-xl border border-border/90 bg-card shadow-2xl ring-1 shadow-slate-900/20 ring-slate-900/6 sm:inset-3 md:inset-6">
              <div className="flex shrink-0 items-center justify-between border-b border-border/80 bg-muted/15 px-4 py-3">
                <p className="text-sm font-semibold tracking-tight text-foreground">
                  Preview
                </p>
                <Button
                  onClick={() => setPreviewOpen(false)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="min-h-0 flex-1 bg-card">
                <iframe
                  className="h-full w-full"
                  sandbox={
                    allowScripts ?
                      "allow-scripts allow-same-origin"
                    : "allow-same-origin"
                  }
                  srcDoc={iframeSrcDoc}
                  title="HTML preview"
                />
              </div>
            </aside>
          </>,
          document.body,
        )
      : null}
    </div>
  );
}
