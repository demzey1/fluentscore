import type { WalletScoreResult } from "@/lib/scoring/types";

interface ScoreBreakdownProps {
  score: WalletScoreResult;
}

function formatMetricValue(value: number | null) {
  if (value === null) {
    return "N/A";
  }
  return String(value);
}

function ScoreBar({ value, max }: { value: number | null; max: number }) {
  if (value === null) {
    return <div className="h-[3px] w-full rounded-full bg-white/8" />;
  }

  const pct = Math.round((value / max) * 100);
  return (
    <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/8">
      <div
        className="h-full rounded-full"
        style={{
          width: `${pct}%`,
          backgroundColor: "oklch(0.65 0.14 165)",
        }}
      />
    </div>
  );
}

function getDataStateMessage(score: WalletScoreResult) {
  if (score.dataState === "data_unavailable") {
    return {
      tone: "warning" as const,
      text: "Fluent data sources are currently unavailable.",
    };
  }

  if (score.dataState === "partial_data") {
    return {
      tone: "warning" as const,
      text: "Partial wallet data only. Score computation is unavailable until explorer data recovers.",
    };
  }

  if (score.dataState === "no_fluent_activity") {
    return {
      tone: "neutral" as const,
      text: "No Fluent Testnet transactions were found for this address yet.",
    };
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
            className="text-5xl leading-none font-semibold tabular-nums sm:text-6xl"
            style={{ color: "oklch(0.65 0.14 165)" }}
          >
            {score.totalScore === null ? "--" : score.totalScore}
          </span>
          <span className="text-muted-foreground mb-1.5 font-mono text-sm">/ 85</span>
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
        <div
          className={`rounded-md border px-4 py-3 ${
            dataStateMessage.tone === "warning"
              ? "border-amber-500/30 bg-amber-500/10"
              : "border-white/12 bg-card"
          }`}
        >
          <p
            className={`text-xs ${
              dataStateMessage.tone === "warning" ? "text-amber-200" : "text-muted-foreground"
            }`}
          >
            {dataStateMessage.text}
          </p>
        </div>
      ) : null}

      <div>
        <h2 className="text-muted-foreground mb-4 font-mono text-xs tracking-widest uppercase">
          Wallet metrics
        </h2>
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-white/8 sm:grid-cols-3">
          {[
            { label: "Transactions", value: score.metrics.transactionCount },
            { label: "Unique contracts", value: score.metrics.uniqueContracts },
            { label: "Active days", value: score.metrics.activeDays },
          ].map((metric) => (
            <div key={metric.label} className="bg-card flex flex-col gap-1 px-5 py-4">
              <span className="text-foreground font-mono text-xl font-medium tabular-nums">
                {formatMetricValue(metric.value)}
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
        Source: Fluent Testnet RPC + Fluentscan API. Scope: on-chain activity only.
      </p>
    </div>
  );
}
