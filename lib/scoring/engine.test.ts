import { describe, expect, it } from "vitest";

import { scoreWallet } from "./engine";

describe("scoreWallet", () => {
  it("returns no-activity score for wallets with zero Fluent transactions", () => {
    const result = scoreWallet({
      totalTransactions: 0,
      uniqueContracts: 0,
      activeDays: 0,
      firstTransactionAt: null,
      lastActivityAt: null,
    });

    expect(result.transactionActivityScore).toBe(0);
    expect(result.contractDiversityScore).toBe(0);
    expect(result.consistencyScore).toBe(0);
    expect(result.totalScore).toBe(0);
    expect(result.summaryLabel).toBe("No Fluent activity");
    expect(result.reasons[0]).toContain("No Fluent transactions");
  });

  it("returns strong activity label for high transactions/diversity without long consistency window", () => {
    const result = scoreWallet({
      totalTransactions: 140,
      uniqueContracts: 40,
      activeDays: 8,
      firstTransactionAt: "2026-04-01T00:00:00.000Z",
      lastActivityAt: "2026-04-08T00:00:00.000Z",
    });

    expect(result.transactionActivityScore).toBe(40);
    expect(result.contractDiversityScore).toBe(25);
    expect(result.consistencyScore).toBeGreaterThan(0);
    expect(result.totalScore).toBeGreaterThanOrEqual(65);
    expect(result.summaryLabel).toBe("Strong activity");
  });

  it("returns consistent user label when activity is sustained over many active days", () => {
    const result = scoreWallet({
      totalTransactions: 60,
      uniqueContracts: 18,
      activeDays: 25,
      firstTransactionAt: "2026-01-01T00:00:00.000Z",
      lastActivityAt: "2026-03-05T00:00:00.000Z",
    });

    expect(result.summaryLabel).toBe("Consistent user");
    expect(result.consistencyScore).toBeGreaterThanOrEqual(12);
  });

  it("returns early participant for low but non-zero Fluent activity", () => {
    const result = scoreWallet({
      totalTransactions: 5,
      uniqueContracts: 2,
      activeDays: 2,
      firstTransactionAt: "2026-04-10T00:00:00.000Z",
      lastActivityAt: "2026-04-11T00:00:00.000Z",
    });

    expect(result.summaryLabel).toBe("Early participant");
    expect(result.totalScore).toBeGreaterThan(0);
    expect(result.totalScore).toBeLessThan(35);
  });

  it("is deterministic for identical input", () => {
    const input = {
      totalTransactions: 22,
      uniqueContracts: 7,
      activeDays: 10,
      firstTransactionAt: "2026-02-01T00:00:00.000Z",
      lastActivityAt: "2026-02-22T00:00:00.000Z",
    } as const;

    const first = scoreWallet(input);
    const second = scoreWallet(input);

    expect(second).toEqual(first);
  });

  it("returns human-readable reasons for each public score category", () => {
    const result = scoreWallet({
      totalTransactions: 50,
      uniqueContracts: 12,
      activeDays: 9,
      firstTransactionAt: "2026-03-01T00:00:00.000Z",
      lastActivityAt: "2026-03-22T00:00:00.000Z",
    });

    expect(result.reasons.length).toBeGreaterThanOrEqual(4);
    expect(result.reasons.join(" ")).toContain("Transaction activity score");
    expect(result.reasons.join(" ")).toContain("Contract diversity score");
    expect(result.reasons.join(" ")).toContain("Consistency score");
    expect(result.reasons.join(" ")).toContain("Total FluentScore");
  });
});
