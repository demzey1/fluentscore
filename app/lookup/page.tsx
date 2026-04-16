import { WalletLookupForm } from "@/components/wallet-lookup-form";
import { Badge } from "@/components/ui/badge";

export default function WalletLookupPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      {/* Header */}
      <div className="space-y-4 text-center">
        <Badge
          variant="outline"
          className="border-primary/30 bg-primary/5 px-3 py-1 text-primary"
        >
          <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
          Fluent Testnet
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Wallet Lookup
        </h1>
        <p className="mx-auto max-w-xl text-muted-foreground">
          Enter a Fluent wallet address to compute and view the latest score
          snapshot. Connect your wallet for quick access.
        </p>
      </div>

      {/* Lookup card */}
      <div className="rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm sm:p-8">
        <WalletLookupForm
          showRecentSearches
          showConnectWallet
          ctaLabel="Analyze Wallet"
          placeholder="Enter wallet address (0x...)"
        />
      </div>

      {/* Info cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border/50 bg-card/30 p-5 backdrop-blur-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <svg
              className="h-5 w-5 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="mb-1 font-semibold">Real-time Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Scores are computed from live Fluent Testnet data with freshness
            indicators.
          </p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/30 p-5 backdrop-blur-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <svg
              className="h-5 w-5 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5"
              />
            </svg>
          </div>
          <h3 className="mb-1 font-semibold">Detailed Breakdown</h3>
          <p className="text-sm text-muted-foreground">
            View activity, diversity, builder, and OG score components with
            explanations.
          </p>
        </div>
      </div>

      {/* Data source notice */}
      <div className="rounded-lg border border-border/30 bg-muted/20 px-4 py-3 text-center text-sm text-muted-foreground">
        <svg
          className="mr-2 inline-block h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
          />
        </svg>
        Data sourced from{" "}
        <a
          href="https://testnet.fluentscan.xyz/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          FluentScan
        </a>{" "}
        and Fluent Testnet RPC. Testnet data may reset periodically.
      </div>
    </div>
  );
}
