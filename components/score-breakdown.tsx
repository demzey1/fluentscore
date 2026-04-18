import type { WalletScoreResult } from "@/lib/scoring/types";

interface ScoreBreakdownProps {
  score: WalletScoreResult;
}

function ScoreBar({ value, max }: { value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/8">
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

function getDataStateMessage(score: WalletScoreResult) {
  if (score.dataState === "explorer_unavailable") {
    return "Fluent explorer is currently unavailable. Results may be incomplete.";
  }

  if (score.dataState === "no_fluent_activity") {
    return "No Fluent on-chain activity was found for this address yet.";
  }

  if (score.dataState === "testnet_sparse") {
    return "Sparse Testnet activity detected. This can happen with fresh or reset environments.";
  }

  return null;
}

export function ScoreBreakdown({ score }: ScoreBreakdownProps) {
  const calculatedDate = new Date(score.calculatedAt);
  const queriedDate = new Date(score.queriedAt);
  const dataStateMessage = getDataStateMessage(score);

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-white/8 pb-6">
        <div className="flex items-end gap-4">
          <span
            className="text-6xl leading-none font-semibold tabular-nums"
            style={{ color: "oklch(0.65 0.14 165)" }}
          >
            {score.totalScore}
          </span>
          <span className="text-muted-foreground mb-1.5 font-mono text-sm">/ 100</span>
        </div>
        <p className="text-muted-foreground font-mono text-xs">
          computed{" "}
          {calculatedDate.toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          })}{" "}
          - chain {score.chainId}
        </p>
        <p className="text-muted-foreground mt-1 font-mono text-xs">
          queried{" "}
          {queriedDate.toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>

      <div className="bg-card rounded-md border border-white/8 px-5 py-4">
        <p className="text-foreground text-sm font-medium">{score.summaryLabel}</p>
        <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{score.reasons[0]}</p>
      </div>

      {dataStateMessage ? (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <p className="text-xs text-amber-200">{dataStateMessage}</p>
        </div>
      ) : null}

      <div>
        <h2 className="text-muted-foreground mb-4 font-mono text-xs tracking-widest uppercase">
          Wallet metrics
        </h2>
        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-md border border-white/8">
          {[
            { label: "Transactions", value: score.metrics.transactionCount },
            { label: "Unique contracts", value: score.metrics.uniqueContracts },
            { label: "Active days", value: score.metrics.activeDays },
          ].map((metric) => (
            <div key={metric.label} className="bg-card flex flex-col gap-1 px-5 py-4">
              <span className="text-foreground font-mono text-xl font-medium tabular-nums">
                {metric.value}
              </span>
              <span className="text-muted-foreground text-xs">{metric.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-muted-foreground mb-4 font-mono text-xs tracking-widest uppercase">
          Score breakdown
        </h2>
        <div className="bg-card flex flex-col gap-4 rounded-md border border-white/8 px-5 py-5">
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

      <p className="text-muted-foreground text-xs">
        Data sourced from Fluent Testnet RPC and Fluentscan indexing. Score reflects
        on-chain activity only - no off-chain signals are included.
      </p>
    </div>
  );
}
