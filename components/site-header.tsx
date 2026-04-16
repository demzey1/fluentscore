import Link from "next/link";

import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="border-border/70 bg-background/95 sticky top-0 z-20 border-b backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          FluentScore
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/lookup">Wallet Lookup</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
