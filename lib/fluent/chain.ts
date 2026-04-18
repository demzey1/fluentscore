import { defineChain } from "viem";

import { DEFAULT_FLUENT_CONFIG } from "@/lib/env";

const fluentRpcUrl =
  process.env.NEXT_PUBLIC_FLUENT_RPC_URL ??
  process.env.FLUENT_RPC_URL ??
  DEFAULT_FLUENT_CONFIG.rpcUrl;
const fluentWsRpcUrl =
  process.env.NEXT_PUBLIC_FLUENT_WS_RPC_URL ??
  process.env.FLUENT_WS_RPC_URL ??
  DEFAULT_FLUENT_CONFIG.wsRpcUrl;
const fluentExplorerUrl =
  process.env.NEXT_PUBLIC_FLUENT_EXPLORER_URL ??
  process.env.FLUENT_EXPLORER_URL ??
  DEFAULT_FLUENT_CONFIG.explorerUrl;
const fluentExplorerApiUrl =
  process.env.NEXT_PUBLIC_FLUENT_EXPLORER_API_URL ??
  process.env.FLUENT_EXPLORER_API_URL ??
  DEFAULT_FLUENT_CONFIG.explorerApiUrl;

export const fluentTestnetChain = defineChain({
  id: DEFAULT_FLUENT_CONFIG.chainId,
  name: DEFAULT_FLUENT_CONFIG.chainName,
  nativeCurrency: {
    name: "Ether",
    symbol: DEFAULT_FLUENT_CONFIG.symbol,
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [fluentRpcUrl],
      webSocket: [fluentWsRpcUrl],
    },
    public: {
      http: [fluentRpcUrl],
      webSocket: [fluentWsRpcUrl],
    },
  },
  blockExplorers: {
    default: {
      name: "FluentScan",
      url: fluentExplorerUrl,
      apiUrl: fluentExplorerApiUrl,
    },
  },
  testnet: true,
});

export type FluentChain = typeof fluentTestnetChain;
