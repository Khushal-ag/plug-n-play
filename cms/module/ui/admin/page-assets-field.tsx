"use client";

import { useCallback, useRef, useState } from "react";

import { Button } from "@cms/components/ui/button";
import { Label } from "@cms/components/ui/label";
import {
  parsePageAssetsJson,
  sanitizeAssetFilename,
  serializePageAssets,
} from "@cms/lib/page-assets";
import { cn } from "@cms/lib/utils";
import { FolderUp, Loader2, Trash2, Upload } from "lucide-react";

type Props = {
  /** Controlled: current assets (use with onChange). If omitted, internal state from initialJson. */
  assets?: Record<string, string>;
  initialJson?: string;
  onChange?: (assets: Record<string, string>) => void;
  /** FormData key for the hidden JSON field (default: pageAssets) */
  formFieldName?: string;
  /** Optional heading override for site-wide vs page-only library */
  heading?: string;
};

function byteLength(s: string): number {
  return new TextEncoder().encode(s).length;
}

export function PageAssetsField({
  assets: controlledAssets,
  initialJson,
  onChange,
  formFieldName = "pageAssets",
  heading,
}: Props) {
  const isControlled = controlledAssets !== undefined;
  const [internal, setInternal] = useState<Record<string, string>>(() =>
    isControlled ? {} : parsePageAssetsJson(initialJson),
  );
  const assets = isControlled ? controlledAssets! : internal;

  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const commit = useCallback(
    (next: Record<string, string>) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  async function readFileContent(file: File): Promise<string | null> {
    const name = sanitizeAssetFilename(file.name);
    if (!name) return null;
    const lower = name.toLowerCase();
    const useDataUrl =
      /\.(png|jpe?g|gif|webp|ico)$/i.test(lower) && !lower.endsWith(".svg");
    if (useDataUrl) {
      return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(r.error);
        r.readAsDataURL(file);
      });
    }
    return file.text();
  }

  async function ingestFileList(files: FileList | File[] | null) {
    const list = Array.from(files ?? []);
    if (list.length === 0) return;

    setProcessing(true);
    setLastMessage(null);

    const skipped: string[] = [];
    const collisions: string[] = [];
    const base = { ...assets };

    const results = await Promise.all(
      list.map(async (file) => {
        const name = sanitizeAssetFilename(file.name);
        if (!name) {
          skipped.push(file.name || "(unnamed)");
          return null;
        }
        if (base[name] !== undefined) collisions.push(name);
        try {
          const content = await readFileContent(file);
          return content !== null ? { name, content } : null;
        } catch {
          skipped.push(file.name);
          return null;
        }
      }),
    );

    const next = { ...base };
    for (const r of results) {
      if (r) next[r.name] = r.content;
    }

    commit(next);

    const parts: string[] = [];
    const added = results.filter(Boolean).length;
    if (added > 0) parts.push(`Added ${added} file${added === 1 ? "" : "s"}`);
    if (skipped.length)
      parts.push(`Skipped ${skipped.length} (invalid type or read error)`);
    if (collisions.length)
      parts.push(
        `${[...new Set(collisions)].length} name collision(s) — last file wins`,
      );
    setLastMessage(parts.length ? parts.join(". ") : null);
    setProcessing(false);
  }

  function remove(name: string) {
    const next = { ...assets };
    delete next[name];
    commit(next);
  }

  const names = Object.keys(assets).sort();
  const totalBytes = names.reduce(
    (acc, n) => acc + byteLength(assets[n] ?? ""),
    0,
  );
  const totalKb = (totalBytes / 1024).toFixed(1);

  const [fileListOpen, setFileListOpen] = useState(true);

  return (
    <div className="space-y-3">
      <input
        name={formFieldName}
        type="hidden"
        value={serializePageAssets(assets)}
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Label className="text-sm font-medium">
            {heading ?? "Page assets (CSS, JS, images)"}
          </Label>
          {names.length > 0 ?
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
              {names.length} file{names.length === 1 ? "" : "s"} · {totalKb} KB
            </span>
          : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            accept=".css,.js,.svg,.png,.jpg,.jpeg,.gif,.webp,.ico,text/css,text/javascript,image/*"
            className="hidden"
            multiple
            onChange={(e) => {
              void ingestFileList(e.target.files);
              e.target.value = "";
            }}
            ref={fileInputRef}
            type="file"
          />
          <input
            className="hidden"
            onChange={(e) => {
              void ingestFileList(e.target.files);
              e.target.value = "";
            }}
            ref={folderInputRef}
            type="file"
            // Non-standard; enables folder upload in Chromium / Safari
            {...{ webkitdirectory: "" }}
          />
          <Button
            className="flex-1 sm:flex-none"
            disabled={processing}
            onClick={() => fileInputRef.current?.click()}
            size="sm"
            type="button"
            variant="secondary"
          >
            {processing ?
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <Upload className="h-3.5 w-3.5" />}
            Upload files
          </Button>
          <Button
            className="flex-1 sm:flex-none"
            disabled={processing}
            onClick={() => folderInputRef.current?.click()}
            size="sm"
            type="button"
            variant="outline"
          >
            <FolderUp className="h-3.5 w-3.5" />
            Folder
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "rounded-lg border-2 border-dashed px-3 py-4 text-center transition-colors",
          dragOver ? "border-slate-400 bg-slate-50" : "border-slate-200",
          processing && "pointer-events-none opacity-60",
        )}
        onDragLeave={(e) => {
          e.preventDefault();
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragOver(false);
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void ingestFileList(e.dataTransfer.files);
        }}
      >
        <p className="text-xs text-slate-600">
          <strong>Drop files here</strong> or use Upload / Folder. Multi-select
          in the file dialog is supported (Shift/Cmd).
        </p>
      </div>

      {lastMessage ?
        <p className="text-xs text-slate-600">{lastMessage}</p>
      : null}

      <p className="text-xs text-slate-500">
        Wait for uploads to finish before <strong>Save</strong> — large images
        are read in parallel. Use the same filenames your HTML references (e.g.{" "}
        <code className="rounded bg-slate-100 px-1">banner1.jpg</code> for{" "}
        <code className="rounded bg-slate-100 px-1">img/banner1.jpg</code>).
      </p>

      {names.length === 0 ?
        <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
          No extra files yet. Paste HTML that links to CSS, JS, or images, then
          add those files here.
        </p>
      : <details
          className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
          onToggle={(e) => {
            setFileListOpen((e.currentTarget as HTMLDetailsElement).open);
          }}
          open={fileListOpen}
        >
          <summary className="cursor-pointer list-none px-3 py-2 text-sm font-medium text-slate-700 [&::-webkit-details-marker]:hidden">
            <span className="inline-flex w-full items-center justify-between gap-2">
              File list
              <span className="text-xs font-normal text-slate-500">
                {names.length} file{names.length === 1 ? "" : "s"} · click to
                collapse
              </span>
            </span>
          </summary>
          <div className="max-h-[min(36rem,70dvh)] min-h-0 touch-pan-y overflow-x-hidden overflow-y-auto overscroll-y-contain border-t border-slate-100 [scrollbar-gutter:stable]">
            <ul className="divide-y divide-slate-200">
              {names.map((name) => (
                <li
                  className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
                  key={name}
                >
                  <span className="truncate font-mono text-xs text-slate-800">
                    {name}
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">
                    {(byteLength(assets[name] ?? "") / 1024).toFixed(1)} KB
                  </span>
                  <Button
                    aria-label={`Remove ${name}`}
                    className="shrink-0"
                    onClick={() => remove(name)}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4 text-slate-500" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </details>
      }
    </div>
  );
}
