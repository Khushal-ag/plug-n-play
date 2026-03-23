"use client";

import { useActionState, useEffect, useState } from "react";

import { Button } from "@cms/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@cms/components/ui/card";
import { replaceSiteAssetsAction } from "@cms/data/site-asset-actions";
import {
  parsePageAssetsJson,
  serializePageAssets,
  SITE_ASSETS_MAX_TOTAL_BYTES,
} from "@cms/lib/page-assets";
import { PageAssetsField } from "@cms/ui/admin/page-assets-field";
import { Loader2 } from "lucide-react";

import type { SiteAssetsFormState } from "@cms/data/site-asset-actions";

const initialState: SiteAssetsFormState = {};

type Props = { initialJson: string };

export function SiteAssetsForm({ initialJson }: Props) {
  const [state, formAction, isPending] = useActionState(
    replaceSiteAssetsAction,
    initialState,
  );
  const [assets, setAssets] = useState<Record<string, string>>(() =>
    parsePageAssetsJson(initialJson),
  );

  useEffect(() => {
    setAssets(parsePageAssetsJson(initialJson));
  }, [initialJson]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shared files</CardTitle>
        <CardDescription>
          Public URLs look like{" "}
          <code className="rounded bg-slate-100 px-1">
            /cms-global-assets/your-file.css
          </code>
          . Total library up to{" "}
          {Math.round(SITE_ASSETS_MAX_TOTAL_BYTES / (1024 * 1024))} MB. Upload
          many files at once (or a folder), wait for processing to finish, then
          click <strong>Save site library</strong> (upload alone does not write
          to the database).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData();
            fd.set("siteAssets", serializePageAssets(assets));
            formAction(fd);
          }}
        >
          {state.error ?
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {state.error}
            </p>
          : null}
          <PageAssetsField
            assets={assets}
            formFieldName="siteAssets"
            heading="Files in this library"
            onChange={setAssets}
          />
          <Button disabled={isPending} type="submit">
            {isPending ?
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            : null}
            Save site library
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
