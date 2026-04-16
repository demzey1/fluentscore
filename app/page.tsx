import { WalletLookupForm } from "@/components/wallet-lookup-form";
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
          />
        </div>
      </section>

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
    </div>
  );
}
