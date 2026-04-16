import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WalletLookupForm } from "@/components/wallet-lookup-form";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="absolute -top-40 right-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 left-1/4 h-60 w-60 rounded-full bg-primary/5 blur-3xl" />
        
        <div className="relative mx-auto w-full max-w-6xl px-6 py-20 md:py-28">
          <div className="flex flex-col items-start gap-6">
            <Badge 
              variant="outline" 
              className="border-primary/30 bg-primary/5 text-primary"
            >
              Fluent Testnet
            </Badge>
            
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-balance md:text-5xl lg:text-6xl">
              Wallet intelligence for{" "}
              <span className="text-primary">Fluent apps</span>
            </h1>
            
            <p className="max-w-2xl text-lg text-muted-foreground text-pretty">
              Score Fluent wallets by ecosystem activity, builder signals, and custom 
              eligibility rules. Built for builders who need reliable wallet intelligence.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button size="lg" className="h-12 px-6" asChild>
                <Link href="/lookup">Check a Wallet</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-12 border-border/50 px-6" 
                asChild
              >
                <Link href="/builder-access">Builder Mode</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Lookup Section */}
      <section className="border-b border-border/50 bg-card/30">
        <div className="mx-auto w-full max-w-6xl px-6 py-12">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-medium">Quick Lookup</h2>
            <WalletLookupForm
              placeholder="Enter a Fluent wallet address (0x...)"
              ctaLabel="Analyze Wallet"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b border-border/50">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
          <div className="mb-12 flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
            <p className="text-muted-foreground">
              Three steps to wallet intelligence
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="group relative rounded-lg border border-border/50 bg-card p-6 transition-colors hover:border-primary/30">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 font-mono text-sm text-primary">
                01
              </div>
              <h3 className="mb-2 font-semibold">Enter Address</h3>
              <p className="text-sm text-muted-foreground">
                Input any wallet address that has interacted with the Fluent Testnet.
              </p>
            </div>
            
            <div className="group relative rounded-lg border border-border/50 bg-card p-6 transition-colors hover:border-primary/30">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 font-mono text-sm text-primary">
                02
              </div>
              <h3 className="mb-2 font-semibold">Analyze Activity</h3>
              <p className="text-sm text-muted-foreground">
                We fetch and analyze on-chain data from Fluent Testnet RPC and FluentScan.
              </p>
            </div>
            
            <div className="group relative rounded-lg border border-border/50 bg-card p-6 transition-colors hover:border-primary/30">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 font-mono text-sm text-primary">
                03
              </div>
              <h3 className="mb-2 font-semibold">Get Score</h3>
              <p className="text-sm text-muted-foreground">
                Receive a detailed breakdown with activity, diversity, and builder scores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Measure */}
      <section className="border-b border-border/50 bg-card/30">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
          <div className="mb-12 flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">What FluentScore measures</h2>
            <p className="text-muted-foreground">
              Comprehensive wallet analysis based on Fluent Testnet activity
            </p>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ScoreCard
              title="Activity Score"
              description="Transaction volume and frequency on Fluent Testnet"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              }
            />
            <ScoreCard
              title="Diversity Score"
              description="Variety of contracts and protocols interacted with"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  <path d="M2 12h20" />
                </svg>
              }
            />
            <ScoreCard
              title="Builder Score"
              description="Contract deployments and developer activity"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              }
            />
            <ScoreCard
              title="Fluent OG Score"
              description="Early adoption and longevity on Fluent"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4Z" />
                  <path d="M3 12h1m16 0h1M12 3v1m0 16v1M5.6 5.6l.7.7m11.4 11.4.7.7M5.6 18.4l.7-.7m11.4-11.4.7-.7" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* Why Builders Use FluentScore */}
      <section>
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
          <div className="mb-12 flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">Why Fluent builders use it</h2>
            <p className="text-muted-foreground">
              Tools to power eligibility and reward systems
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-border/50 bg-card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold">Eligibility Gating</h3>
              <p className="text-sm text-muted-foreground">
                Define custom rule sets to determine wallet eligibility for airdrops, 
                allowlists, and token-gated features based on real Fluent activity.
              </p>
            </div>
            
            <div className="rounded-lg border border-border/50 bg-card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold">Snapshot Persistence</h3>
              <p className="text-sm text-muted-foreground">
                Wallet scores and activity snapshots are cached and stored for consistent, 
                reproducible eligibility checks across your application.
              </p>
            </div>
            
            <div className="rounded-lg border border-border/50 bg-card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" x2="8" y1="13" y2="13" />
                  <line x1="16" x2="8" y1="17" y2="17" />
                  <line x1="10" x2="8" y1="9" y2="9" />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold">Custom Rule Sets</h3>
              <p className="text-sm text-muted-foreground">
                Create and manage eligibility rules in Builder Mode. Set minimum scores, 
                transaction counts, active days, and more.
              </p>
            </div>
            
            <div className="rounded-lg border border-border/50 bg-card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold">Real-time Data</h3>
              <p className="text-sm text-muted-foreground">
                Scores are calculated from live Fluent Testnet data with clear freshness 
                indicators and last indexed timestamps.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ScoreCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-card p-5 transition-colors hover:border-primary/30">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mb-1 text-sm font-semibold">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
