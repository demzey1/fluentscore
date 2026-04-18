import type { Address } from "viem";

export interface ScoreBreakdown {
  activity: number | null;
  diversity: number | null;
  consistency: number | null;
}

export type ScoreSummaryLabel =
  | "Strong activity"
  | "Early participant"
  | "Consistent user"
  | "Low activity"
  | "No Fluent activity"
  | "Data unavailable";

export type WalletDataState =
  | "ok"
  | "no_fluent_activity"
  | "partial_data"
  | "data_unavailable";

export interface WalletScoreResult {
  address: Address;
  chainId: number;
  totalScore: number | null;
  breakdown: {
    activity: number | null;
    diversity: number | null;
    consistency: number | null;
  };
  summaryLabel: ScoreSummaryLabel;
  reasons: string[];
  queriedAt: string;
  dataState: WalletDataState;
  sourceHealth: {
    explorer: "ok" | "degraded";
    rpc: "ok" | "degraded";
    warnings: string[];
  };
  metrics: {
    transactionCount: number | null;
    uniqueContracts: number | null;
    activeDays: number | null;
  };
  firstTxTimestamp: string | null;
  lastTxTimestamp: string | null;
  calculatedAt: string;
}
