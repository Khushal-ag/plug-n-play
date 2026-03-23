"use client";

import { Button } from "@cms/components/ui/button";
import { deletePageAction } from "@cms/data/page-actions";
import { Trash2 } from "lucide-react";

type Props = {
  id: number;
  title: string;
};

export function DeletePageButton({ id, title }: Props) {
  return (
    <form
      action={deletePageAction}
      onSubmit={(e) => {
        if (!confirm(`Delete “${title}”? This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input name="id" type="hidden" value={id} />
      <Button
        className="h-auto gap-1.5 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
        type="submit"
        variant="ghost"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </Button>
    </form>
  );
}
