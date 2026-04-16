"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { isAddress } from "viem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = address.trim();
    if (!isAddress(trimmed)) {
      setError("Enter a valid EVM wallet address");
      return;
    }
    setError(null);
    setIsLoading(true);
    router.push(`/score/${trimmed}`);
  };

  return (
    <section className="relative pt-12 pb-8">
      {/* Animated background effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
          <div className="h-[500px] w-[800px] rounded-full bg-primary/10 blur-[120px]" />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div className="animate-fade-in opacity-0">
          <Badge
            variant="outline"
            className="mb-6 border-primary/30 bg-primary/5 px-4 py-1.5 text-primary"
          >
            <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
            Fluent Testnet
          </Badge>
        </div>

        <h1 className="animate-fade-in stagger-1 mb-6 text-balance text-4xl font-bold tracking-tight opacity-0 sm:text-5xl lg:text-6xl">
          Wallet intelligence for{" "}
          <span className="gradient-text">Fluent apps</span>
        </h1>

        <p className="animate-fade-in stagger-2 mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground opacity-0 sm:text-xl">
          Score Fluent wallets by ecosystem activity, builder signals, and
          custom eligibility rules. Built for developers building on Fluent.
        </p>

        {/* Wallet lookup form */}
        <form
          onSubmit={onSubmit}
          className="animate-fade-in stagger-3 mx-auto mb-8 max-w-2xl opacity-0"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Input
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter wallet address (0x...)"
                className="h-14 border-border/50 bg-card/50 pl-4 pr-4 font-mono text-base backdrop-blur-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                aria-label="Fluent wallet address"
              />
              {error && (
                <p className="absolute -bottom-6 left-0 text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="h-14 min-w-[160px] bg-primary text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Analyzing...
                </span>
              ) : (
                "Check Wallet"
              )}
            </Button>
          </div>
        </form>

        {/* CTA buttons */}
        <div className="animate-fade-in stagger-4 flex flex-col items-center justify-center gap-4 opacity-0 sm:flex-row">
          <Button
            variant="outline"
            size="lg"
            asChild
            className="min-w-[160px] border-border/50 bg-card/30 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card/50"
          >
            <Link href="/lookup">Browse Lookups</Link>
          </Button>
          <Button
            variant="ghost"
            size="lg"
            asChild
            className="min-w-[160px] text-muted-foreground transition-all hover:text-foreground"
          >
            <Link href="/builder-access">
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Builder Mode
            </Link>
          </Button>
        </div>

        {/* Stats preview */}
        <div className="animate-fade-in stagger-5 mt-16 grid grid-cols-2 gap-4 opacity-0 sm:grid-cols-4">
          {[
            { label: "Wallets Scored", value: "10K+" },
            { label: "Transactions Indexed", value: "500K+" },
            { label: "Rule Sets Active", value: "50+" },
            { label: "Data Freshness", value: "~5 min" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border/50 bg-card/30 p-4 backdrop-blur-sm transition-all hover:border-border hover:bg-card/50"
            >
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
