import { z } from "zod";

const decimalStringSchema = z.string().regex(/^\d+$/);
const hexAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/);

export const ExplorerTransactionSchema = z
  .object({
    blockNumber: decimalStringSchema,
    timeStamp: decimalStringSchema,
    hash: z.string().min(1),
    nonce: decimalStringSchema,
    blockHash: z.string().optional(),
    transactionIndex: decimalStringSchema.optional(),
    from: hexAddressSchema,
    to: z.string().nullable().optional(),
    value: decimalStringSchema,
    gas: decimalStringSchema.optional(),
    gasPrice: decimalStringSchema.optional(),
    input: z.string().optional(),
    contractAddress: z.string().optional(),
    isError: z.string().optional(),
    txreceipt_status: z.string().optional(),
  })
  .passthrough();

const explorerTxResultSchema = z.union([
  z.array(ExplorerTransactionSchema),
  z.string(),
]);

export const ExplorerTxListResponseSchema = z
  .object({
    status: z.enum(["0", "1"]),
    message: z.string(),
    result: explorerTxResultSchema,
  });

export const ExplorerBalanceResponseSchema = z
  .object({
    status: z.enum(["0", "1"]),
    message: z.string(),
    result: decimalStringSchema,
  })
  .passthrough();

export type ExplorerTransaction = z.infer<typeof ExplorerTransactionSchema>;
export type ExplorerTxListResponse = z.infer<typeof ExplorerTxListResponseSchema>;
export type ExplorerBalanceResponse = z.infer<typeof ExplorerBalanceResponseSchema>;
