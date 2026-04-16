import type { WalletScoreResult } from "@/lib/scoring/types";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ScoreBreakdownProps {
  score: WalletScoreResult;
}

export function ScoreBreakdown({ score }: ScoreBreakdownProps) {
  return (
    <Card>
      <CardHeader className="gap-2">
        <CardTitle className="flex items-center justify-between gap-3">
          <span>Fluent Wallet Score</span>
          <Badge variant="secondary">Score: {score.totalScore}/100</Badge>
        </CardTitle>
        <CardDescription>
          Calculated at {new Date(score.calculatedAt).toLocaleString()} on chain{" "}
          {score.chainId}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Score Contribution</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Transactions</TableCell>
              <TableCell>{score.metrics.transactionCount}</TableCell>
              <TableCell>{score.breakdown.activity}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Unique Contracts</TableCell>
              <TableCell>{score.metrics.uniqueContracts}</TableCell>
              <TableCell>{score.breakdown.diversity}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Active Days</TableCell>
              <TableCell>{score.metrics.activeDays}</TableCell>
              <TableCell>{score.breakdown.consistency}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Native Balance (ETH)</TableCell>
              <TableCell>{Number(score.metrics.nativeBalanceEth).toFixed(6)}</TableCell>
              <TableCell>{score.breakdown.balance}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
