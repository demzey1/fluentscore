import { afterEach, describe, expect, it, vi } from "vitest";

import { DataUnavailableError, ExplorerError } from "../errors";
import { fluentClient } from "./client";
import * as explorerClient from "./explorer-client";
import { getNormalizedWalletSnapshot } from "./wallet";

const testAddress = "0x0000000000000000000000000000000000000001" as const;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getNormalizedWalletSnapshot", () => {
  it("builds full explorer snapshot when explorer data is available", async () => {
    vi.spyOn(explorerClient, "getAddressTransactions").mockResolvedValue({
      noActivity: false,
      transactions: [
        {
          blockNumber: "1",
          timeStamp: "1700000000",
          hash: "0xhash1",
          nonce: "0",
          from: testAddress,
          to: "0x0000000000000000000000000000000000000002",
          value: "0",
          input: "0x1234",
          contractAddress: "",
        },
        {
          blockNumber: "2",
          timeStamp: "1700086400",
          hash: "0xhash2",
          nonce: "1",
          from: testAddress,
          to: "0x0000000000000000000000000000000000000003",
          value: "0",
          input: "0x",
          contractAddress: "0x0000000000000000000000000000000000000004",
        },
      ],
    });

    const snapshot = await getNormalizedWalletSnapshot(testAddress);

    expect(snapshot.dataState).toBe("ok");
    expect(snapshot.source).toBe("explorer");
    expect(snapshot.transactionCount).toBe(2);
    expect(snapshot.uniqueContracts).toBe(2);
    expect(snapshot.activeDays).toBe(2);
    expect(snapshot.firstTxTimestamp).not.toBeNull();
    expect(snapshot.lastTxTimestamp).not.toBeNull();
  });

  it("uses RPC fallback and marks snapshot as partial when explorer is unavailable", async () => {
    vi.spyOn(explorerClient, "getAddressTransactions").mockRejectedValue(
      new ExplorerError("down"),
    );
    vi.spyOn(fluentClient, "getTransactionCount").mockResolvedValue(7);

    const snapshot = await getNormalizedWalletSnapshot(testAddress);

    expect(snapshot.source).toBe("rpc_fallback");
    expect(snapshot.dataState).toBe("partial_data");
    expect(snapshot.transactionCount).toBe(7);
    expect(snapshot.uniqueContracts).toBeNull();
    expect(snapshot.activeDays).toBeNull();
  });

  it("throws DataUnavailableError when explorer and RPC fallback both fail", async () => {
    vi.spyOn(explorerClient, "getAddressTransactions").mockRejectedValue(
      new ExplorerError("down"),
    );
    vi.spyOn(fluentClient, "getTransactionCount").mockRejectedValue(new Error("rpc down"));

    await expect(getNormalizedWalletSnapshot(testAddress)).rejects.toBeInstanceOf(
      DataUnavailableError,
    );
  });
});
