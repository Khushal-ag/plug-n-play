"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { Button } from "@cms/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@cms/components/ui/card";
import { Checkbox } from "@cms/components/ui/checkbox";
import { Input } from "@cms/components/ui/input";
import { Label } from "@cms/components/ui/label";
import {
  mergeAssetMaps,
  parsePageAssetsJson,
  serializePageAssets,
} from "@cms/lib/page-assets";
import { cardChrome } from "@cms/lib/ui-surface";
import { cn } from "@cms/lib/utils";
import { EditorTips } from "@cms/ui/admin/editor-tips";
import { HtmlWorkspace } from "@cms/ui/admin/html-workspace";
import { KeywordsInput } from "@cms/ui/admin/keywords-input";
import { PageAssetsField } from "@cms/ui/admin/page-assets-field";
import { ChevronDown, Loader2 } from "lucide-react";

import type { PageRow } from "@cms/data/pages";
import type { FormEvent } from "react";

type SaveAction = (formData: FormData) => void | Promise<void>;

type Props = {
  saveAction: SaveAction;
  submitLabel: string;
  initial?: PageRow;
  siteWideAssets?: Record<string, string>;
};

export function PageEditor({
  saveAction,
  submitLabel,
  initial,
  siteWideAssets,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [html, setHtml] = useState(initial?.html ?? "");
  const [pageAssets, setPageAssets] = useState<Record<string, string>>(() =>
    parsePageAssetsJson(initial?.page_assets),
  );
  const previewMergedAssets = useMemo(
    () => mergeAssetMaps(siteWideAssets ?? {}, pageAssets),
    [siteWideAssets, pageAssets],
  );
  useEffect(() => {
    setHtml(initial?.html ?? "");
  }, [initial?.html, initial?.id]);

  useEffect(() => {
    setPageAssets(parsePageAssetsJson(initial?.page_assets));
  }, [initial?.page_assets, initial?.id]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("html", html);
    fd.set("pageAssets", serializePageAssets(pageAssets));
    startTransition(() => {
      void saveAction(fd);
    });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {initial ?
        <input name="id" type="hidden" value={initial.id} />
      : null}

      <div
        className={cn(
          "mb-1 rounded-xl border border-border/90 bg-card px-3 py-3 sm:mb-2",
          cardChrome,
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Checkbox
            className="gap-3 py-1"
            defaultChecked={initial ? initial.is_published === 1 : true}
            label="Visible on site"
            name="isPublished"
          />
          <Button className="min-w-[132px]" disabled={pending} type="submit">
            {pending ?
              <Loader2 className="h-4 w-4 animate-spin" />
            : null}
            {submitLabel}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Content</CardTitle>
          <CardDescription>
            HTML stored for this page. Put a <strong>snippet</strong>, a{" "}
            <strong>section</strong>, or a <strong>full document</strong>
            —whatever matches how your site is built.
          </CardDescription>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The public site may wrap this in shared layout pieces, or show it as
            you wrote it. That comes from your project&apos;s app routes and
            layout—not from rules in this editor.
          </p>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <HtmlWorkspace
            onChange={setHtml}
            previewAssets={previewMergedAssets}
            previewLinkSlug={initial?.slug}
            value={html}
          />
          <details className="group rounded-xl border border-border/80 bg-muted/35">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              Tips
            </summary>
            <div className="border-t border-border/60 px-3 py-2.5">
              <EditorTips />
            </div>
          </details>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Page files</CardTitle>
          <CardDescription>
            Match filenames used in your HTML · overrides shared library for
            this page only
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <PageAssetsField
            assets={pageAssets}
            key={initial?.id ?? "new-page"}
            onChange={setPageAssets}
          />
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>URL &amp; title</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 pt-0">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                defaultValue={initial?.title}
                id="title"
                name="title"
                placeholder="Page title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <div className="flex rounded-lg border border-border bg-card shadow-sm focus-within:border-primary/35 focus-within:ring-2 focus-within:ring-ring/20">
                <span className="flex items-center border-r border-border px-3 text-sm text-muted-foreground">
                  /
                </span>
                <Input
                  className="border-0 shadow-none focus-visible:ring-0"
                  defaultValue={initial?.slug}
                  id="slug"
                  name="slug"
                  placeholder="about"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Use <code className="rounded bg-muted px-1">home</code> for /
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>SEO</CardTitle>
            <CardDescription>Optional</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-0">
            <div className="space-y-2">
              <Label htmlFor="metaDescription">Description</Label>
              <Input
                defaultValue={initial?.meta_description ?? ""}
                id="metaDescription"
                name="metaDescription"
                placeholder="~150 characters"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaKeywords">Keywords</Label>
              <KeywordsInput
                initialValue={initial?.meta_keywords ?? ""}
                name="metaKeywords"
                placeholder="Add, Enter"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
