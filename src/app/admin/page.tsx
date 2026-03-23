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
import { LayoutDashboard, Lock } from "lucide-react";

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
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_-10%,oklch(0.97_0.04_264/0.22)_0%,transparent_55%),linear-gradient(180deg,oklch(0.99_0.014_264/0.4)_0%,transparent_45%),linear-gradient(168deg,oklch(0.986_0.022_85/0.55)_0%,transparent_52%)]"
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {cmsBrandName}
          </h1>
        </div>

        <Card className="border-border/90 shadow-lg shadow-slate-900/6">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Enter your admin password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <form action={loginAction} className="space-y-4">
              <div className="space-y-2">
                <Label className="normal-case" htmlFor="password">
                  Password
                </Label>
                <Input
                  autoComplete="current-password"
                  id="password"
                  name="password"
                  placeholder="Password"
                  required
                  type="password"
                />
              </div>
              <Button className="w-full" type="submit">
                <Lock className="h-4 w-4" />
                Sign in
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild variant="link">
              <Link href="/">Back to site</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
