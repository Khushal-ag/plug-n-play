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
      <CardHeader className="pb-3">
        <CardTitle>Library</CardTitle>
        <CardDescription>
          Save after uploading · max ~{" "}
          {Math.round(SITE_ASSETS_MAX_TOTAL_BYTES / (1024 * 1024))} MB total
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData();
            fd.set("siteAssets", serializePageAssets(assets));
            formAction(fd);
          }}
        >
          {state.error ?
            <p
              className="rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {state.error}
            </p>
          : null}
          <PageAssetsField
            assets={assets}
            formFieldName="siteAssets"
            heading="Shared files"
            onChange={setAssets}
          />
          <Button disabled={isPending} type="submit">
            {isPending ?
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            : null}
            Save
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
