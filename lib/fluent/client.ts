import { createPublicClient, defineChain, http } from "viem";

export const fluentTestnetChain = defineChain({
  id: 20_994,
  name: "Fluent Testnet",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.fluent.xyz/"],
      webSocket: ["wss://rpc.testnet.fluent.xyz/ws"],
    },
    public: {
      http: ["https://rpc.testnet.fluent.xyz/"],
      webSocket: ["wss://rpc.testnet.fluent.xyz/ws"],
    },
  },
  blockExplorers: {
    default: {
      name: "FluentScan",
      url: "https://testnet.fluentscan.xyz/",
      apiUrl: "https://testnet.fluentscan.xyz/api/",
    },
  },
  testnet: true,
});

export const fluentClient = createPublicClient({
  chain: fluentTestnetChain,
  transport: http("https://rpc.testnet.fluent.xyz/"),
});
