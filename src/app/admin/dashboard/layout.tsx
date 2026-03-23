import { AdminAppShell } from "@cms/ui/admin/admin-app-shell";

import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Studio",
};

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AdminAppShell>{children}</AdminAppShell>;
}
