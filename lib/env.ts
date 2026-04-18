import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z
    .string()
    .min(1)
    .default("postgresql://postgres:postgres@localhost:5432/fluentscore?schema=public"),
  FLUENT_RPC_URL: z.string().url().default("https://rpc.testnet.fluent.xyz/"),
  FLUENTSCAN_API_URL: z.string().url().default("https://testnet.fluentscan.xyz/api/"),
  BUILDER_PASSCODE: z.string().min(1).default("123456@"),
});

export const env = envSchema.parse(process.env);

export const DEFAULT_FLUENT_CONFIG = {
  chainName: "Fluent Testnet",
  chainId: 20_994,
  symbol: "ETH",
  rpcUrl: "https://rpc.testnet.fluent.xyz/",
  wsRpcUrl: "wss://rpc.testnet.fluent.xyz/ws",
  explorerUrl: "https://testnet.fluentscan.xyz/",
  fluentscanApiUrl: "https://testnet.fluentscan.xyz/api/",
} as const;
