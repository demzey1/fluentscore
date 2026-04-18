import type { Address } from "viem";

export interface ScoreBreakdown {
  activity: number;
  diversity: number;
  consistency: number;
}

export type ScoreSummaryLabel =
  | "Strong activity"
  | "Early participant"
  | "Consistent user"
  | "Low activity"
  | "No Fluent activity";

export type WalletDataState =
  | "ok"
  | "no_fluent_activity"
  | "explorer_unavailable"
  | "testnet_sparse";

export interface WalletScoreResult {
  address: Address;
  chainId: number;
  totalScore: number;
  breakdown: ScoreBreakdown;
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
    transactionCount: number;
    uniqueContracts: number;
    activeDays: number;
    nativeBalanceWei: string;
    nativeBalanceEth: string;
  };
  calculatedAt: string;
}
