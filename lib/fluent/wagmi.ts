import { createConfig, createStorage, fallback, http, webSocket } from "wagmi";

import { fluentTestnetChain } from "@/lib/fluent/chain";

const FLUENT_RPC_URL = "https://rpc.testnet.fluent.xyz/";
const FLUENT_WS_RPC_URL = "wss://rpc.testnet.fluent.xyz/ws";

export const fluentWagmiConfig = createConfig({
  chains: [fluentTestnetChain],
  ssr: true,
  storage: createStorage({
    key: "fluentscore.wagmi",
    storage:
      typeof window !== "undefined" ? window.localStorage : undefined,
  }),
  transports: {
    [fluentTestnetChain.id]: fallback([webSocket(FLUENT_WS_RPC_URL), http(FLUENT_RPC_URL)]),
  },
});
