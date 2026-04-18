import Link from "next/link";
import { isAddress } from "viem";

import { ScoreBreakdown } from "@/components/score-breakdown";
import { WalletLookupForm } from "@/components/wallet-lookup-form";
import { getFluentWalletScore } from "@/lib/scoring/wallet-score";

interface ScorePageProps {
  params: Promise<{
    address: string;
  }>;
}

export default async function ScorePage({ params }: ScorePageProps) {
  const { address } = await params;

  if (!isAddress(address)) {
    return (
      <div className="flex flex-col gap-6 max-w-xl">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-foreground">
            Invalid address
          </h1>
          <p className="text-sm text-muted-foreground">
            The address in this URL is not a valid EVM address. Check the format
            and try again.
          </p>
        </div>
        <WalletLookupForm />
      </div>
    );
  }

  const score = await getFluentWalletScore(address);

  return (
    <div className="flex flex-col gap-8">
      {/* Address header */}
      <div className="flex flex-col gap-1 border-b border-white/8 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-sm font-medium text-muted-foreground">
            Wallet score
          </h1>
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Score another
          </Link>
        </div>
        <p className="font-mono text-sm text-foreground break-all">
          {score.address}
        </p>
      </div>

      {/* Score content */}
      <ScoreBreakdown score={score} />
    </div>
  );
}
