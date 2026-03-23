"use client";

import dynamic from "next/dynamic";

import { AdminSidebarFallback } from "@cms/ui/admin/admin-sidebar-fallback";
import { PageEditorFallback } from "@cms/ui/admin/page-editor-fallback";

export const AdminSidebarDynamic = dynamic(
  () =>
    import("@cms/ui/admin/admin-sidebar").then((m) => ({
      default: m.AdminSidebar,
    })),
  { ssr: false, loading: AdminSidebarFallback },
);

export const PageEditorDynamic = dynamic(
  () =>
    import("@cms/ui/admin/page-editor").then((m) => ({
      default: m.PageEditor,
    })),
  { ssr: false, loading: PageEditorFallback },
);
