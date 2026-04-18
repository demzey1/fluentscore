import { createConfig, createStorage, fallback, http, webSocket } from "wagmi";

import { DEFAULT_FLUENT_CONFIG } from "@/lib/env";
import { fluentTestnetChain } from "@/lib/fluent/chain";

const fluentRpcUrl =
  process.env.NEXT_PUBLIC_FLUENT_RPC_URL ?? DEFAULT_FLUENT_CONFIG.rpcUrl;
const fluentWsRpcUrl =
  process.env.NEXT_PUBLIC_FLUENT_WS_RPC_URL ?? DEFAULT_FLUENT_CONFIG.wsRpcUrl;

export const fluentWagmiConfig = createConfig({
  chains: [fluentTestnetChain],
  ssr: true,
  storage: createStorage({
    key: "fluentscore.wagmi",
    storage:
      typeof window !== "undefined" ? window.localStorage : undefined,
  }),
  transports: {
    [fluentTestnetChain.id]: fallback([webSocket(fluentWsRpcUrl), http(fluentRpcUrl)]),
  },
});
