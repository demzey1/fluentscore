import type { WalletScoreResult } from "@/lib/scoring/types";

<<<<<<< HEAD
=======
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

>>>>>>> 1027c6cb2035fb5a23c6ae5ffc1b1eeb07b835a9
interface ScoreBreakdownProps {
  score: WalletScoreResult;
}

<<<<<<< HEAD
function ScoreBar({ value, max }: { value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="h-[3px] w-full rounded-full bg-white/8 overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${pct}%`,
          backgroundColor: "oklch(0.65 0.14 165)",
        }}
      />
    </div>
  );
}

export function ScoreBreakdown({ score }: ScoreBreakdownProps) {
  const calculatedDate = new Date(score.calculatedAt);

  return (
    <div className="flex flex-col gap-6">

      {/* Score header */}
      <div className="flex flex-col gap-1 border-b border-white/8 pb-6">
        <div className="flex items-end gap-4">
          <span
            className="text-6xl font-semibold tabular-nums leading-none"
            style={{ color: "oklch(0.65 0.14 165)" }}
          >
            {score.totalScore}
          </span>
          <span className="mb-1.5 font-mono text-sm text-muted-foreground">
            / 100
          </span>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          computed{" "}
          {calculatedDate.toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          })}{" "}
          · chain {score.chainId}
        </p>
      </div>

      {/* Metrics grid — 3 columns, no balance */}
      <div>
        <h2 className="mb-4 font-mono text-xs tracking-widest uppercase text-muted-foreground">
          Wallet metrics
        </h2>
        <div className="grid grid-cols-3 gap-px border border-white/8 rounded-md overflow-hidden">
          {[
            { label: "Transactions", value: score.metrics.transactionCount },
            { label: "Unique contracts", value: score.metrics.uniqueContracts },
            { label: "Active days", value: score.metrics.activeDays },
          ].map((m) => (
            <div key={m.label} className="flex flex-col gap-1 bg-card px-5 py-4">
              <span className="font-mono text-xl font-medium tabular-nums text-foreground">
                {m.value}
              </span>
              <span className="text-xs text-muted-foreground">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Score breakdown — no weight labels, no native balance */}
      <div>
        <h2 className="mb-4 font-mono text-xs tracking-widest uppercase text-muted-foreground">
          Score breakdown
        </h2>
        <div className="flex flex-col gap-4 rounded-md border border-white/8 bg-card px-5 py-5">
          {[
            {
              label: "Transaction activity",
              value: score.breakdown.activity,
              max: 40,
            },
            {
              label: "Contract diversity",
              value: score.breakdown.diversity,
              max: 25,
            },
            {
              label: "Consistency",
              value: score.breakdown.consistency,
              max: 20,
            },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-2">
              <span className="text-sm text-foreground/80">{item.label}</span>
              <ScoreBar value={item.value} max={item.max} />
            </div>
          ))}
        </div>
      </div>

      {/* Provenance */}
      <p className="text-xs text-muted-foreground">
        Data sourced from Fluent Testnet RPC and Fluentscan indexing. Score
        reflects on-chain activity only — no off-chain signals are included.
      </p>
    </div>
=======
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
>>>>>>> 1027c6cb2035fb5a23c6ae5ffc1b1eeb07b835a9
  );
}
