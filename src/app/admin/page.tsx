import Link from "next/link";
import { redirect } from "next/navigation";

import { loginAction } from "@cms/auth/admin-actions";
import { isAdminAuthenticated } from "@cms/auth/session";
import { Alert, AlertDescription, AlertTitle } from "@cms/components/ui/alert";
import { Button } from "@cms/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@cms/components/ui/card";
import { Input } from "@cms/components/ui/input";
import { Label } from "@cms/components/ui/label";
import { cmsAdminBasePath, cmsBrandName } from "@cms/config";
import { Lock, Sparkles } from "lucide-react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: Props) {
  const authenticated = await isAdminAuthenticated();
  if (authenticated) {
    redirect(`${cmsAdminBasePath}/dashboard`);
  }

  const params = await searchParams;
  const hasError = params.error === "invalid";

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(226 232 240 / 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgb(226 232 240 / 0.5) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white to-transparent"
      />

      <div className="relative w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Sparkles className="h-7 w-7 text-slate-800" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {cmsBrandName}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to manage pages and content
          </p>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Admin access</CardTitle>
            <CardDescription>
              Enter the password from your environment configuration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {hasError ?
              <Alert variant="destructive">
                <Lock />
                <AlertTitle>Invalid password</AlertTitle>
                <AlertDescription>
                  Set{" "}
                  <code className="rounded px-1.5 py-0.5 text-xs">
                    ADMIN_PASSWORD
                  </code>{" "}
                  in your environment.
                </AlertDescription>
              </Alert>
            : null}

            <form action={loginAction} className="space-y-5">
              <div className="space-y-2">
                <Label className="normal-case" htmlFor="password">
                  Password
                </Label>
                <Input
                  autoComplete="current-password"
                  id="password"
                  name="password"
                  placeholder="Enter admin password"
                  required
                  type="password"
                />
              </div>
              <Button className="w-full rounded-xl py-6" type="submit">
                <Lock className="h-4 w-4" />
                Continue to studio
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-slate-100 pt-6">
            <Button asChild variant="link">
              <Link href="/">View public site</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
