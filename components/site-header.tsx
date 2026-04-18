import Link from "next/link";

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
      </div>
    </header>
  );
}
