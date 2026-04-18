"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { WagmiProvider } from "wagmi";

import { fluentWagmiConfig } from "@/lib/fluent/wagmi";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <WagmiProvider config={fluentWagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
