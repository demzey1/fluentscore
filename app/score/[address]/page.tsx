import Link from "next/link";
import { isAddress } from "viem";

import { ScoreBreakdown } from "@/components/score-breakdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      </div>
    );
  }

  const score = await getFluentWalletScore(address);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Wallet Score</h1>
          <p className="text-muted-foreground text-sm">{score.address}</p>
        </div>
        <Badge variant="outline">Fluent Testnet</Badge>
      </div>
      <ScoreBreakdown score={score} />
    </div>
  );
}
