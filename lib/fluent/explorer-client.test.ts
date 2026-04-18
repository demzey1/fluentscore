import { afterEach, describe, expect, it, vi } from "vitest";

import { ExplorerError } from "../errors";
import { getAddressTransactions } from "./explorer-client";

const testAddress = "0x0000000000000000000000000000000000000001" as const;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getAddressTransactions", () => {
  it("returns noActivity only when no-transaction semantics are explicit", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "0",
          message: "No transactions found",
          result: "No transactions found",
        }),
        { status: 200 },
      ),
    );

    const result = await getAddressTransactions(testAddress);

    expect(result.noActivity).toBe(true);
    expect(result.transactions).toHaveLength(0);
  });

  it("throws unavailable on ambiguous status=0 responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "0",
          message: "NOTOK",
          result: "Max rate limit reached",
        }),
        { status: 200 },
      ),
    );

    await expect(getAddressTransactions(testAddress)).rejects.toBeInstanceOf(ExplorerError);
  });

  it("returns parsed transactions for healthy explorer responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "1",
          message: "OK",
          result: [
            {
              blockNumber: "1",
              timeStamp: "1700000000",
              hash: "0xhash",
              nonce: "0",
              from: "0x0000000000000000000000000000000000000001",
              to: "0x0000000000000000000000000000000000000002",
              value: "0",
              input: "0x",
              contractAddress: "",
            },
          ],
        }),
        { status: 200 },
      ),
    );

    const result = await getAddressTransactions(testAddress);

    expect(result.noActivity).toBe(false);
    expect(result.transactions).toHaveLength(1);
  });
});
