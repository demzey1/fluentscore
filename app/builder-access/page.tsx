import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { hasBuilderSession } from "@/lib/auth/builder-session";

import { unlockBuilderModeAction } from "./actions";

interface BuilderAccessPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function BuilderAccessPage({
  searchParams,
}: BuilderAccessPageProps) {
  if (await hasBuilderSession()) {
    redirect("/builder");
  }

  const { error } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Builder Mode Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Enter the builder passcode to unlock Builder Mode for this browser session.
          </p>
          <form action={unlockBuilderModeAction} className="space-y-3">
            <Input
              id="passcode"
              name="passcode"
              type="password"
              placeholder="Enter passcode"
              required
              minLength={1}
            />
            <Button type="submit" className="w-full">
              Unlock Builder Mode
            </Button>
          </form>
          {error ? (
            <p className="text-sm text-red-600">Passcode incorrect. Try again.</p>
          ) : null}
          <p className="text-muted-foreground text-xs">
            Temporary gate only: this passcode flow is not real authentication.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
