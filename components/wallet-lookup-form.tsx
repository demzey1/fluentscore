"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState, useEffect } from "react";
import { isAddress } from "viem";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface WalletLookupFormProps {
  placeholder?: string;
  ctaLabel?: string;
  className?: string;
}

const RECENT_SEARCHES_KEY = "fluentscore-recent-searches";
const MAX_RECENT_SEARCHES = 5;

export function WalletLookupForm({
  placeholder = "0x...",
  ctaLabel = "View Score",
  className,
}: WalletLookupFormProps) {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored));
        } catch {
          // ignore parse errors
        }
      }
    }
  }, []);

  const saveRecentSearch = (addr: string) => {
    const updated = [addr, ...recentSearches.filter((s) => s !== addr)].slice(
      0,
      MAX_RECENT_SEARCHES
    );
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = address.trim();
    if (!isAddress(trimmed)) {
      setError("Enter a valid EVM wallet address.");
      return;
    }
    setError(null);
    setIsLoading(true);
    saveRecentSearch(trimmed);
    router.push(`/score/${trimmed}`);
  };

  const handleRecentClick = (addr: string) => {
    setAddress(addr);
    setError(null);
    setIsLoading(true);
    saveRecentSearch(addr);
    router.push(`/score/${addr}`);
  };

  return (
    <div className={cn("w-full", className)}>
      <form onSubmit={onSubmit} className="flex w-full max-w-2xl flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Input
              value={address}
              onChange={(event) => {
                setAddress(event.target.value);
                if (error) setError(null);
              }}
              placeholder={placeholder}
              className={cn(
                "h-12 bg-card/50 font-mono text-sm placeholder:font-sans placeholder:text-muted-foreground",
                error && "border-destructive focus-visible:ring-destructive"
              )}
              aria-label="Fluent wallet address"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            className="h-12 min-w-36 font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
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
                Analyzing...
              </span>
            ) : (
              ctaLabel
            )}
          </Button>
        </div>
        {error && (
          <p className="flex items-center gap-1.5 text-sm text-destructive">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
            {error}
          </p>
        )}
      </form>

      {recentSearches.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Recent:</span>
          {recentSearches.map((addr) => (
            <button
              key={addr}
              type="button"
              onClick={() => handleRecentClick(addr)}
              className="rounded-md border border-border/50 bg-card/50 px-2.5 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
            >
              {addr.slice(0, 6)}...{addr.slice(-4)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
