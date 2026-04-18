import Link from "next/link";
import { isAddress } from "viem";

import { ScoreBreakdown } from "@/components/score-breakdown";
<<<<<<< HEAD
import { WalletLookupForm } from "@/components/wallet-lookup-form";
=======
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
>>>>>>> 1027c6cb2035fb5a23c6ae5ffc1b1eeb07b835a9
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
<<<<<<< HEAD
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
=======
      <div className="mx-auto w-full max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Invalid wallet address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              The address in this URL is not a valid EVM address.
            </p>
            <Button asChild>
              <Link href="/lookup">Go back to lookup</Link>
            </Button>
          </CardContent>
        </Card>
>>>>>>> 1027c6cb2035fb5a23c6ae5ffc1b1eeb07b835a9
      </div>
    );
  }

  const score = await getFluentWalletScore(address);

  return (
<<<<<<< HEAD
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
=======
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Wallet Score</h1>
          <p className="text-muted-foreground text-sm">{score.address}</p>
        </div>
        <Badge variant="outline">Fluent Testnet</Badge>
      </div>
>>>>>>> 1027c6cb2035fb5a23c6ae5ffc1b1eeb07b835a9
      <ScoreBreakdown score={score} />
    </div>
  );
}
