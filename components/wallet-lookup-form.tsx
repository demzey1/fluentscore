"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState, useEffect } from "react";
import { isAddress } from "viem";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WalletLookupFormProps {
  placeholder?: string;
  ctaLabel?: string;
  showRecentSearches?: boolean;
  showConnectWallet?: boolean;
}

const RECENT_SEARCHES_KEY = "fluentscore_recent_searches";
const MAX_RECENT_SEARCHES = 5;

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addRecentSearch(address: string) {
  if (typeof window === "undefined") return;
  try {
    const searches = getRecentSearches();
    const filtered = searches.filter(
      (s) => s.toLowerCase() !== address.toLowerCase()
    );
    const updated = [address, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}

export function WalletLookupForm({
  placeholder = "Enter wallet address (0x...)",
  ctaLabel = "View Score",
  showRecentSearches = false,
  showConnectWallet = false,
}: WalletLookupFormProps) {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const { address: connectedAddress, isConnected } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (showRecentSearches) {
      setRecentSearches(getRecentSearches());
    }
  }, [showRecentSearches]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = address.trim();
    if (!isAddress(trimmed)) {
      setError("Enter a valid EVM wallet address");
      return;
    }
    setError(null);
    setIsLoading(true);
    addRecentSearch(trimmed);
    router.push(`/score/${trimmed}`);
  };

  const handleRecentClick = (recentAddress: string) => {
    setAddress(recentAddress);
    setError(null);
  };

  const handleUseConnected = () => {
    if (connectedAddress) {
      setAddress(connectedAddress);
      setError(null);
    }
  };

  const handleConnect = () => {
    connect({ connector: injected() });
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="w-full space-y-4">
      <form onSubmit={onSubmit} className="flex w-full flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Input
              value={address}
              onChange={(event) => {
                setAddress(event.target.value);
                if (error) setError(null);
              }}
              placeholder={placeholder}
              className="h-12 border-border/50 bg-card/50 font-mono text-sm backdrop-blur-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              aria-label="Fluent wallet address"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 min-w-[140px] bg-primary text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Loading...
              </span>
            ) : (
              ctaLabel
            )}
          </Button>
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </form>

      {/* Connect wallet section */}
      {showConnectWallet && (
        <div className="flex flex-wrap items-center gap-2">
          {isConnected ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUseConnected}
                className="border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
              >
                <svg
                  className="mr-1.5 h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
                  />
                </svg>
                Use {truncateAddress(connectedAddress!)}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => disconnect()}
                className="text-muted-foreground hover:text-foreground"
              >
                Disconnect
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleConnect}
              disabled={isConnecting}
              className="border-border/50 bg-card/30"
            >
              {isConnecting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-3.5 w-3.5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Connecting...
                </span>
              ) : (
                <>
                  <svg
                    className="mr-1.5 h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
                    />
                  </svg>
                  Connect Wallet
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Recent searches */}
      {showRecentSearches && recentSearches.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Recent searches
          </p>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((recentAddress) => (
              <button
                key={recentAddress}
                type="button"
                onClick={() => handleRecentClick(recentAddress)}
                className="group flex items-center gap-1.5 rounded-lg border border-border/50 bg-card/30 px-3 py-1.5 font-mono text-xs transition-all hover:border-primary/30 hover:bg-primary/5"
              >
                <span className="text-muted-foreground group-hover:text-foreground">
                  {truncateAddress(recentAddress)}
                </span>
                <svg
                  className="h-3 w-3 text-muted-foreground/50 group-hover:text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
