import Link from "next/link";

<<<<<<< HEAD
export function SiteHeader() {
  return (
    <header className="relative z-20 border-b border-white/8">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-sm font-medium tracking-wide text-foreground/90 hover:text-foreground transition-colors"
        >
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: "oklch(0.65 0.14 165)" }}
            aria-hidden="true"
          />
          FluentScore
        </Link>

        <div className="flex items-center gap-5">
          <span
            className="rounded px-2 py-0.5 text-xs font-mono"
            style={{
              color: "oklch(0.65 0.14 165)",
              backgroundColor: "oklch(0.65 0.14 165 / 0.1)",
              border: "1px solid oklch(0.65 0.14 165 / 0.25)",
            }}
          >
            20994
          </span>
          <Link
            href="/builder-access"
            className="text-xs text-muted-foreground hover:text-foreground/70 transition-colors"
          >
            builder
          </Link>
        </div>
=======
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
>>>>>>> 1027c6cb2035fb5a23c6ae5ffc1b1eeb07b835a9
      </div>
    </header>
  );
}
