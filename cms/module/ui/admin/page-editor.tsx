"use client";

import { useEffect, useState, useTransition } from "react";

import { Button } from "@cms/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@cms/components/ui/card";
import { Input } from "@cms/components/ui/input";
import { Label } from "@cms/components/ui/label";
import { EditorTips } from "@cms/ui/admin/editor-tips";
import { HtmlWorkspace } from "@cms/ui/admin/html-workspace";
import { KeywordsInput } from "@cms/ui/admin/keywords-input";
import { Loader2, PanelRightOpen, X } from "lucide-react";
import { createPortal } from "react-dom";

import type { PageRow } from "@cms/data/pages";
import type { FormEvent } from "react";

type SaveAction = (formData: FormData) => void | Promise<void>;

type Props = {
  saveAction: SaveAction;
  submitLabel: string;
  initial?: PageRow;
};

export function PageEditor({ saveAction, submitLabel, initial }: Props) {
  const [pending, startTransition] = useTransition();
  const [html, setHtml] = useState(initial?.html ?? "");
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setHtml(initial?.html ?? "");
  }, [initial?.html, initial?.id]);

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("html", html);
    startTransition(() => {
      void saveAction(fd);
    });
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {initial ?
        <input name="id" type="hidden" value={initial.id} />
      : null}

      <div className="sticky top-0 z-30 -mx-2 mb-2 rounded-xl border border-slate-200 bg-white/95 px-3 py-2.5 shadow-sm backdrop-blur-sm sm:mx-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex cursor-pointer items-start gap-3 sm:items-center">
            <input
              className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 sm:mt-0"
              defaultChecked={initial ? initial.is_published === 1 : true}
              name="isPublished"
              type="checkbox"
            />
            <span>
              <span className="block text-sm font-medium text-slate-900">
                Published
              </span>
              <span className="text-xs text-slate-500">
                Unpublished pages are hidden from public routes.
              </span>
            </span>
          </label>
          <Button className="min-w-[140px]" disabled={pending} type="submit">
            {pending ?
              <Loader2 className="h-4 w-4 animate-spin" />
            : null}
            {submitLabel}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>Page content</CardTitle>
            <CardDescription>
              Primary editing workspace. Use Split or Preview to validate
              layout.
            </CardDescription>
          </div>
          <Button
            className="shrink-0"
            onClick={() => setWorkflowOpen(true)}
            type="button"
            variant="secondary"
          >
            <PanelRightOpen className="h-4 w-4" />
            Workflow
          </Button>
        </CardHeader>
        <CardContent>
          <HtmlWorkspace onChange={setHtml} value={html} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Page details</CardTitle>
            <CardDescription>Title and URL slug</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                defaultValue={initial?.title}
                id="title"
                name="title"
                placeholder="e.g. Product overview"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL slug</Label>
              <div className="flex rounded-lg border border-slate-200 bg-white shadow-sm focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200">
                <span className="flex items-center border-r border-slate-200 px-3 text-sm text-slate-400">
                  /
                </span>
                <Input
                  className="border-0 shadow-none focus-visible:ring-0"
                  defaultValue={initial?.slug}
                  id="slug"
                  name="slug"
                  placeholder="product-overview"
                  required
                />
              </div>
              <p className="text-xs text-slate-500">
                Slug{" "}
                <code className="rounded bg-slate-100 px-1 text-slate-700">
                  home
                </code>{" "}
                also maps to root{" "}
                <code className="rounded bg-slate-100 px-1 text-slate-700">
                  /
                </code>
                .
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO</CardTitle>
            <CardDescription>Search and sharing metadata</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta description</Label>
              <Input
                defaultValue={initial?.meta_description ?? ""}
                id="metaDescription"
                name="metaDescription"
                placeholder="Shown in search results (~150–160 characters)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaKeywords">Meta keywords</Label>
              <KeywordsInput
                initialValue={initial?.meta_keywords ?? ""}
                name="metaKeywords"
                placeholder="Type keyword and press Enter"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {mounted && workflowOpen ?
        createPortal(
          <>
            <button
              aria-label="Close workflow panel"
              className="fixed inset-0 z-90 bg-slate-900/35 backdrop-blur-[1px]"
              onClick={() => setWorkflowOpen(false)}
              type="button"
            />
            <aside className="fixed inset-y-0 right-0 z-100 w-full max-w-md border-l border-slate-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <p className="text-sm font-semibold text-slate-900">
                  Editorial workflow
                </p>
                <Button
                  onClick={() => setWorkflowOpen(false)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="h-[calc(100dvh-57px)] overflow-y-auto p-5">
                <EditorTips />
              </div>
            </aside>
          </>,
          document.body,
        )
      : null}
    </form>
  );
}
