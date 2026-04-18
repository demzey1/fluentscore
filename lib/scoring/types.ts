import type { Address } from "viem";

export interface ScoreBreakdown {
  activity: number;
  diversity: number;
  consistency: number;
  balance: number;
}

export interface WalletScoreResult {
  address: Address;
  chainId: number;
  totalScore: number;
  breakdown: ScoreBreakdown;
  metrics: {
    transactionCount: number;
    uniqueContracts: number;
    activeDays: number;
    nativeBalanceWei: string;
    nativeBalanceEth: string;
  };
  calculatedAt: string;
}
