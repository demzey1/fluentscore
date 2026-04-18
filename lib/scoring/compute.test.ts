import { describe, expect, it } from "vitest";

import type { NormalizedWalletSnapshot } from "../fluent/wallet";
import { computeFluentWalletScore } from "./compute";

const address = "0x0000000000000000000000000000000000000001" as const;

function buildSnapshot(
  overrides: Partial<NormalizedWalletSnapshot>,
): NormalizedWalletSnapshot {
  return {
    address,
    chainId: 20_994,
    fetchedAt: "2026-04-18T00:00:00.000Z",
    transactionCount: 0,
    uniqueContracts: 0,
    activeDays: 0,
    firstTxTimestamp: null,
    lastTxTimestamp: null,
    dataState: "no_fluent_activity",
    source: "explorer",
    rawPayload: {},
    ...overrides,
  };
}

describe("computeFluentWalletScore", () => {
  it("computes deterministic scores for full explorer snapshots", () => {
    const score = computeFluentWalletScore(
      buildSnapshot({
        dataState: "ok",
        source: "explorer",
        transactionCount: 10,
        uniqueContracts: 3,
        activeDays: 4,
      }),
    );

    expect(score.totalScore).toBe(40);
    expect(score.breakdown.activity).toBe(20);
    expect(score.breakdown.diversity).toBe(12);
    expect(score.breakdown.consistency).toBe(8);
    expect(score.dataState).toBe("ok");
  });

  it("returns partial_data semantics when explorer metrics are unavailable", () => {
    const score = computeFluentWalletScore(
      buildSnapshot({
        dataState: "partial_data",
        source: "rpc_fallback",
        transactionCount: 8,
        uniqueContracts: null,
        activeDays: null,
      }),
    );

    expect(score.dataState).toBe("partial_data");
    expect(score.totalScore).toBeNull();
    expect(score.breakdown.activity).toBeNull();
    expect(score.metrics.transactionCount).toBe(8);
    expect(score.metrics.uniqueContracts).toBeNull();
    expect(score.summaryLabel).toBe("Data unavailable");
  });
});
