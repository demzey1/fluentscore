"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { isAddress } from "viem";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WalletLookupFormProps {
  placeholder?: string;
  ctaLabel?: string;
}

export function WalletLookupForm({
  placeholder = "0x…",
  ctaLabel = "View Score",
}: WalletLookupFormProps) {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = address.trim();
    if (!isAddress(trimmed)) {
      setError("Not a valid EVM address.");
      return;
    }
    setError(null);
    router.push(`/score/${trimmed}`);
  };

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            if (error) setError(null);
          }}
          placeholder={placeholder}
          className="h-10 flex-1 font-mono text-sm"
          aria-label="Fluent wallet address"
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
        />
        <Button
          type="submit"
          className="h-10 shrink-0 px-5 text-sm"
          style={{
            backgroundColor: "oklch(0.65 0.14 165)",
            color: "oklch(0.09 0 0)",
          }}
        >
          {ctaLabel}
        </Button>
      </div>
      {error ? (
        <p className="font-mono text-xs text-destructive">{error}</p>
      ) : null}
    </form>
  );
}
