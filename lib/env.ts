import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z
    .url()
    .default("postgresql://postgres:postgres@localhost:5432/fluentscore?schema=public"),
  FLUENT_RPC_URL: z.url().default("https://rpc.testnet.fluent.xyz/"),
  FLUENT_WS_RPC_URL: z.url().default("wss://rpc.testnet.fluent.xyz/ws"),
  FLUENT_EXPLORER_URL: z.url().default("https://testnet.fluentscan.xyz/"),
  FLUENT_EXPLORER_API_URL: z.url().default("https://testnet.fluentscan.xyz/api/"),
  BUILDER_MODE_PASSCODE: z.string().min(1).default("123456"),
});

export const env = envSchema.parse(process.env);

export const DEFAULT_FLUENT_CONFIG = {
  chainName: "Fluent Testnet",
  chainId: 20_994,
  symbol: "ETH",
  rpcUrl: "https://rpc.testnet.fluent.xyz/",
  wsRpcUrl: "wss://rpc.testnet.fluent.xyz/ws",
  explorerUrl: "https://testnet.fluentscan.xyz/",
  explorerApiUrl: "https://testnet.fluentscan.xyz/api/",
} as const;
