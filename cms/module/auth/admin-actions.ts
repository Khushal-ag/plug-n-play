"use server";

import { redirect } from "next/navigation";

import { clearAdminSession, setAdminSession } from "@cms/auth/session";
import { cmsAdminBasePath } from "@cms/config";

export async function loginAction(formData: FormData): Promise<void> {
  const password = String(formData.get("password") ?? "");
  const adminPassword = process.env.ADMIN_PASSWORD ?? "change-me";

  if (password !== adminPassword) {
    redirect(`${cmsAdminBasePath}?error=invalid`);
  }

  await setAdminSession();
  redirect(`${cmsAdminBasePath}/dashboard`);
}

export async function logoutAction(): Promise<void> {
  await clearAdminSession();
  redirect(cmsAdminBasePath);
}
