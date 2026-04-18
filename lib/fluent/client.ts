import { createPublicClient, fallback, http, webSocket } from "viem";

import { env } from "@/lib/env";
import { fluentTestnetChain } from "@/lib/fluent/chain";

export const fluentPublicClient = createPublicClient({
  chain: fluentTestnetChain,
  transport: fallback([webSocket(env.FLUENT_WS_RPC_URL), http(env.FLUENT_RPC_URL)]),
});
