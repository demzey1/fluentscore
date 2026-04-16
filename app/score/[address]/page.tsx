import Link from "next/link";
import { isAddress } from "viem";
import { Suspense } from "react";

import { ScoreBreakdown } from "@/components/score-breakdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFluentWalletScore } from "@/lib/scoring/wallet-score";

interface ScorePageProps {
  params: Promise<{
    address: string;
  }>;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Main score card skeleton */}
      <div className="rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm sm:p-8">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-12">
          {/* Score ring skeleton */}
          <div className="flex flex-col items-center gap-4">
            <div className="h-[180px] w-[180px] animate-shimmer rounded-full" />
            <div className="h-4 w-32 animate-shimmer rounded" />
          </div>

          {/* Score cards skeleton */}
          <div className="w-full flex-1">
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-28 animate-shimmer rounded-xl"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Labels skeleton */}
      <div className="h-20 animate-shimmer rounded-xl" />

      {/* Metrics skeleton */}
      <div className="h-48 animate-shimmer rounded-xl" />
    </div>
  );
}

function InvalidAddressState() {
  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="mb-6 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <svg
            className="h-8 w-8 text-destructive"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
      </div>
      <h1 className="mb-3 text-2xl font-bold">Invalid Wallet Address</h1>
      <p className="mb-6 text-muted-foreground">
        The address provided is not a valid EVM wallet address. Please check the
        address and try again.
      </p>
      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/lookup">Try Another Lookup</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="mb-6 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
          <svg
            className="h-8 w-8 text-warning"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
      </div>
      <h1 className="mb-3 text-2xl font-bold">Unable to Load Score</h1>
      <p className="mb-6 text-muted-foreground">{message}</p>
      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <Button onClick={() => window.location.reload()}>Retry</Button>
        <Button variant="outline" asChild>
          <Link href="/lookup">Try Different Wallet</Link>
        </Button>
      </div>
    </div>
  );
}

function truncateAddress(address: string) {
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

async function ScoreContent({ address }: { address: string }) {
  try {
    const score = await getFluentWalletScore(address as `0x${string}`);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Wallet Score
              </h1>
              <Badge
                variant="outline"
                className="border-primary/30 bg-primary/5 text-primary"
              >
                <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                Fluent Testnet
              </Badge>
            </div>
            <p className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
              <span className="hidden sm:inline">{address}</span>
              <span className="sm:hidden">{truncateAddress(address)}</span>
              <button
                onClick={() => navigator.clipboard.writeText(address)}
                className="rounded p-1 transition-colors hover:bg-muted"
                title="Copy address"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                  />
                </svg>
              </button>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a
                href={`https://testnet.fluentscan.xyz/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  className="mr-1.5 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>
                View on FluentScan
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/lookup">New Lookup</Link>
            </Button>
          </div>
        </div>

        <ScoreBreakdown score={score} />
      </div>
    );
  } catch (error) {
    return (
      <ErrorState
        message={
          error instanceof Error
            ? error.message
            : "Failed to fetch wallet score. The wallet may have no activity on Fluent Testnet."
        }
      />
    );
  }
}

export default async function ScorePage({ params }: ScorePageProps) {
  const { address } = await params;

  if (!isAddress(address)) {
    return <InvalidAddressState />;
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Suspense fallback={<LoadingSkeleton />}>
        <ScoreContent address={address} />
      </Suspense>
    </div>
  );
}
