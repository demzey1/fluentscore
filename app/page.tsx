import { WalletLookupForm } from "@/components/wallet-lookup-form";
<<<<<<< HEAD

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-8 pt-8">
        <div className="flex flex-col gap-3">
          <p
            className="font-mono text-xs tracking-widest uppercase"
            style={{ color: "oklch(0.65 0.14 165)" }}
          >
            Fluent Testnet · chain 20994
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Analyze any address on Fluent Testnet.
          </h1>
          <p className="max-w-lg text-sm text-muted-foreground leading-relaxed">
            Derived entirely from on-chain activity — transactions, contract
            interactions, and usage patterns.
          </p>
        </div>

        <div className="w-full max-w-xl">
          <WalletLookupForm
            placeholder="0x…  wallet address"
            ctaLabel="Score Wallet"
=======
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="from-primary/90 to-primary relative overflow-hidden rounded-3xl bg-gradient-to-r p-8 text-white sm:p-10">
        <div className="absolute -top-16 right-0 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="relative space-y-5">
          <Badge variant="secondary" className="bg-white/20 text-white">
            Fluent Ecosystem Only
          </Badge>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Wallet intelligence and eligibility scoring for Fluent Testnet.
          </h1>
          <p className="max-w-2xl text-white/90">
            Analyze Fluent wallet activity, generate a score, and persist normalized
            snapshots for eligibility workflows.
          </p>
          <WalletLookupForm
            placeholder="Enter a Fluent wallet address"
            ctaLabel="Analyze Wallet"
>>>>>>> 1027c6cb2035fb5a23c6ae5ffc1b1eeb07b835a9
          />
        </div>
      </section>

<<<<<<< HEAD
      {/* ── Divider ──────────────────────────────────────────────────── */}
      <div className="border-t border-white/8" />

      {/* ── What it measures ─────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
          Measured from
        </h2>
        <div className="grid grid-cols-1 gap-px sm:grid-cols-3 border border-white/8 rounded-md overflow-hidden">
          {[
            {
              label: "Transaction activity",
              detail: "Volume and recency of txs sent from this address on Fluent Testnet",
            },
            {
              label: "Contract interactions",
              detail: "Breadth of unique smart contracts engaged with across the network",
            },
            {
              label: "On-chain consistency",
              detail: "Distinct active days — measures sustained vs one-time usage",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col gap-2 bg-card px-5 py-5"
            >
              <span className="text-sm font-medium text-foreground">
                {item.label}
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Data from Fluent Testnet RPC and Fluentscan. No other chains included.
        </p>
      </section>

=======
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Fluent-only activity</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Score inputs come only from Fluent Testnet RPC and FluentScan explorer data.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Normalized snapshots</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Wallet snapshots and score breakdowns are cached and persisted for reuse.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Builder workflow</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Private builder tooling lives behind a dedicated access route and is hidden from
            public navigation.
          </CardContent>
        </Card>
      </section>
>>>>>>> 1027c6cb2035fb5a23c6ae5ffc1b1eeb07b835a9
    </div>
  );
}
