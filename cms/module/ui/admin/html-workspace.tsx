"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@cms/components/ui/button";
import { Label } from "@cms/components/ui/label";
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
};

type ViewMode = "code" | "preview";

export function HtmlWorkspace({ value, onChange }: Props) {
  const [allowScripts, setAllowScripts] = useState(false);
  const [editorHeight, setEditorHeight] = useState(680);
  const [isMaximized, setIsMaximized] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<ViewMode>("code");

  const extensions = useMemo(() => [githubLight, html()], []);
  const workspaceHeight = isMaximized ? 920 : editorHeight;
  const workspaceHeightPx = `${workspaceHeight}px`;

  useEffect(() => {
    setMounted(true);
  }, []);

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
      <div className="bg-linear-to-b from-slate-50 to-white flex flex-col gap-3 rounded-xl border border-slate-200 p-2.5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100/70 p-1">
          <button
            className={
              view === "code" ?
                "inline-flex h-8 items-center gap-2 rounded-md bg-white px-3 text-xs font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200"
              : "inline-flex h-8 items-center gap-2 rounded-md px-3 text-xs font-medium text-slate-600 hover:bg-white/70 hover:text-slate-900"
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
                "inline-flex h-8 items-center gap-2 rounded-md bg-white px-3 text-xs font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200"
              : "inline-flex h-8 items-center gap-2 rounded-md px-3 text-xs font-medium text-slate-600 hover:bg-white/70 hover:text-slate-900"
            }
            onClick={() => setView("preview")}
            type="button"
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
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
            <span className="min-w-[56px] text-center text-[11px] font-medium text-slate-600">
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
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
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
          <Label className="ml-1 flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600 normal-case">
            <input
              checked={allowScripts}
              className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
              onChange={(e) => setAllowScripts(e.target.checked)}
              type="checkbox"
            />
            Allow scripts
          </Label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {view === "code" ?
          <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="absolute top-2 right-2 z-10 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              <Button
                className="h-7 gap-1 rounded-md border border-slate-200 bg-white/95 px-2 text-[11px] shadow-sm"
                onClick={() => setPreviewOpen(true)}
                size="sm"
                type="button"
                variant="ghost"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Overlay
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
        : <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50/80 shadow-inner">
            <div className="border-b border-slate-200 bg-white px-3 py-2">
              <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-slate-500 uppercase">
                <FileCode2 className="h-3.5 w-3.5" />
                Live preview
              </p>
            </div>
            <div className="relative min-h-0 flex-1 bg-white">
              <iframe
                className="w-full"
                sandbox={
                  allowScripts ?
                    "allow-scripts allow-same-origin"
                  : "allow-same-origin"
                }
                srcDoc={
                  value ||
                  "<p style='padding:1rem;color:#64748b'>No HTML yet.</p>"
                }
                style={{ height: workspaceHeightPx }}
                title="HTML preview"
              />
            </div>
          </div>
        }
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
        <p className="text-[11px] font-semibold tracking-wide text-slate-700 uppercase">
          Preview note
        </p>
        <p className="mt-1 text-xs text-slate-600">
          Overlay preview is close to the live page. Scripts run only when{" "}
          <span className="font-medium text-slate-800">Allow scripts</span> is
          enabled.
        </p>
      </div>

      {mounted && previewOpen ?
        createPortal(
          <>
            <button
              aria-label="Close preview overlay"
              className="fixed inset-0 z-90 bg-slate-900/45 backdrop-blur-[1px]"
              onClick={() => setPreviewOpen(false)}
              type="button"
            />
            <aside className="fixed inset-3 z-100 rounded-xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">
                  Live preview
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
              <div className="h-[calc(100%-57px)] bg-white">
                <iframe
                  className="h-full w-full"
                  sandbox={
                    allowScripts ?
                      "allow-scripts allow-same-origin"
                    : "allow-same-origin"
                  }
                  srcDoc={
                    value ||
                    "<p style='padding:1rem;color:#64748b'>No HTML yet.</p>"
                  }
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
