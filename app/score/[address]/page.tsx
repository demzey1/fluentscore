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
      <div className="flex max-w-xl flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-foreground text-lg font-semibold">Invalid address</h1>
          <p className="text-muted-foreground text-sm">
            The address in this URL is not a valid EVM address. Check the format and try
            again.
          </p>
        </div>
        <WalletLookupForm />
      </div>
    );
  }

  let score: Awaited<ReturnType<typeof getFluentWalletScore>>;
  try {
    score = await getFluentWalletScore(address);
  } catch {
    return (
      <div className="flex max-w-xl flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-foreground text-lg font-semibold">Data unavailable</h1>
          <p className="text-muted-foreground text-sm">
            Fluent data could not be retrieved for this request. Please try again shortly.
          </p>
        </div>
        <WalletLookupForm />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-8">
      <div className="border-b border-white/8 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-muted-foreground text-sm font-medium">Wallet score</h1>
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
          >
            &larr; Score another
          </Link>
        </div>
        <p className="text-foreground break-all font-mono text-sm">{score.address}</p>
      </div>

      <ScoreBreakdown score={score} />
    </div>
  );
}
