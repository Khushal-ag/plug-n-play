import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { cmsAdminBasePath, cmsConfig } from "@cms/config";

function getAdminSessionTtlSeconds(): number {
  const rawHours = process.env.CMS_ADMIN_SESSION_HOURS;
  const hours = Number(rawHours);
  if (Number.isFinite(hours) && hours > 0) {
    return Math.floor(hours * 60 * 60);
  }
  return 6 * 60 * 60;
}

function getSecret(): string {
  const password = process.env[cmsConfig.adminPasswordEnv] ?? "change-me";
  return crypto.createHash("sha256").update(password).digest("hex");
}

function signPayload(payload: string): string {
  const secret = getSecret();
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export async function setAdminSession(): Promise<void> {
  const ttlSeconds = getAdminSessionTtlSeconds();
  const expiresAt = Date.now() + ttlSeconds * 1000;
  const payload = `admin:${expiresAt}`;
  const signature = signPayload(payload);
  const store = await cookies();
  store.set(cmsConfig.cookieName, `${payload}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ttlSeconds,
  });
}

export async function clearAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(cmsConfig.cookieName);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const raw = store.get(cmsConfig.cookieName)?.value;
  if (!raw) return false;

  const dot = raw.indexOf(".");
  if (dot === -1) return false;
  const payload = raw.slice(0, dot);
  const signature = raw.slice(dot + 1);
  if (!payload || !signature) return false;

  const sep = payload.indexOf(":");
  if (sep === -1) return false;
  const role = payload.slice(0, sep);
  const expiresAt = Number(payload.slice(sep + 1));
  if (role !== "admin" || !Number.isFinite(expiresAt)) return false;
  if (Date.now() >= expiresAt) return false;

  return signPayload(payload) === signature;
}

export async function requireAdmin(): Promise<void> {
  const ok = await isAdminAuthenticated();
  if (!ok) redirect(cmsAdminBasePath);
}
